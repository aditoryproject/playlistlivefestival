'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  Trash2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import {
  triggerCompensationSubmitPixels,
  triggerJoinCompensationWaGroupPixels,
} from '@/lib/pixels';

interface CompensationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function CompensationModal({ isOpen, onClose, title, subtitle }: CompensationModalProps) {
  // Form Field States
  const [fullName, setFullName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [ktpImageUrl, setKtpImageUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [ticketProofUrl, setTicketProofUrl] = useState('');
  const [ticketCount, setTicketCount] = useState('');

  // Upload progress states
  const [uploadingKtp, setUploadingKtp] = useState(false);
  const [uploadingTicket, setUploadingTicket] = useState(false);

  // Form submission UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [waGroupUrl, setWaGroupUrl] = useState('https://chat.whatsapp.com/');

  if (!isOpen) return null;

  const handleFileUpload = async (
    file: File,
    setUploadState: (v: boolean) => void,
    setUrlState: (url: string) => void
  ) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar. Maksimal 10 MB.');
      return;
    }

    setUploadState(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah file.');
      }

      setUrlState(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat upload file.');
    } finally {
      setUploadState(false);
    }
  };

  const handleClearForm = () => {
    setFullName('');
    setIdentityNumber('');
    setKtpImageUrl('');
    setWhatsapp('');
    setEmail('');
    setTicketProofUrl('');
    setTicketCount('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!fullName.trim()) {
      setErrorMsg('Nama Lengkap (Sesuai KTP) wajib diisi.');
      return;
    }
    if (!identityNumber.trim()) {
      setErrorMsg('Nomor Identitas (KTP) wajib diisi.');
      return;
    }
    if (!ktpImageUrl) {
      setErrorMsg('Upload KTP wajib diunggah.');
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMsg('Nomor WhatsApp (Wajib Aktif) wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Alamat Email (Wajib Aktif) wajib diisi.');
      return;
    }
    if (!ticketProofUrl) {
      setErrorMsg('Upload Bukti E-Tiket Pembelian Tiket 2024 wajib diunggah.');
      return;
    }
    if (!ticketCount.trim()) {
      setErrorMsg('Jumlah Tiket yang ingin dikompensasi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/compensation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          identityNumber,
          ktpImageUrl,
          whatsapp,
          email,
          ticketProofUrl,
          ticketCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengirimkan pengajuan kompensasi.');
      }

      if (data.waGroupUrl) {
        setWaGroupUrl(data.waGroupUrl);
      }

      // Trigger Pixel Tracking Lead Event
      triggerCompensationSubmitPixels(title || 'Compensation Form Submission');

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-100 rounded-2xl shadow-2xl overflow-hidden my-8 border border-zinc-200 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-emerald-950 text-white px-6 py-5 flex items-start justify-between relative shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
              Formulir Resmi Kompensasi
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-white">
              {title || 'Kompensasi Tiket Playlist Live Super Festival 2024'}
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-lg leading-relaxed">
              {subtitle ||
                'Kompensasi berupa Discount 50% dari harga PRESALE 1 - FESTIVAL 2 DAY PASS pada event Playlist Rewind Festival 2026'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 ml-2"
            aria-label="Tutup Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-zinc-800">
          {submitted ? (
            /* SUCCESS STATE */
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm border border-zinc-200 my-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Pengajuan Kompensasi Berhasil!</h3>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
                Terima kasih <strong className="text-zinc-900">{fullName}</strong>. Data dan dokumen kompensasi Anda telah kami terima dan tersimpan dengan aman.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-xl text-left space-y-1">
                <p className="font-bold text-emerald-950">Status Pengajuan:</p>
                <p>
                  Tim kami akan memverifikasi data Anda dan mengirimkan informasi kompensasi diskon 50% melalui Email / WhatsApp yang telah Anda daftarkan.
                </p>
              </div>
              <div className="pt-3 flex justify-center">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Tutup Halaman
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Notice */}
              <div className="bg-white rounded-xl p-4 border border-zinc-200 text-xs text-red-600 font-semibold">
                * Indicates required question
              </div>

              {/* 1. Nama Lengkap */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your answer"
                  className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                />
              </div>

              {/* 2. Nomor Identitas */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Nomor Identitas (KTP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  placeholder="Your answer"
                  className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                />
              </div>

              {/* 3. Upload KTP */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-3">
                <div>
                  <label className="block text-sm font-bold text-zinc-900">
                    Upload KTP <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 mt-0.5">Upload 1 supported file. Max 10 MB.</p>
                </div>

                {ktpImageUrl ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="truncate font-medium">{ktpImageUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setKtpImageUrl('')}
                      className="p-1 text-red-600 hover:text-red-800 shrink-0 ml-2"
                      title="Hapus file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 cursor-pointer transition-all">
                    {uploadingKtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Add file</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, setUploadingKtp, setKtpImageUrl);
                      }}
                      disabled={uploadingKtp}
                    />
                  </label>
                )}
              </div>

              {/* 4. Nomor WhatsApp */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Nomor WhatsApp (Wajib Aktif) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Your answer"
                  className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                />
              </div>

              {/* 5. Alamat Email */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Alamat Email (Wajib Aktif) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your answer"
                  className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                />
              </div>

              {/* 6. Upload Bukti E-Tiket */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-3">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 leading-snug">
                    Upload Bukti E-Tiket (E-Mail) Pembelian Tiket Playlist Live Super Festival 2024 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 mt-0.5">Upload 1 supported file: PDF, document, or image. Max 10 MB.</p>
                </div>

                {ticketProofUrl ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="truncate font-medium">{ticketProofUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTicketProofUrl('')}
                      className="p-1 text-red-600 hover:text-red-800 shrink-0 ml-2"
                      title="Hapus file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 cursor-pointer transition-all">
                    {uploadingTicket ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Add file</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, setUploadingTicket, setTicketProofUrl);
                      }}
                      disabled={uploadingTicket}
                    />
                  </label>
                )}
              </div>

              {/* 7. Jumlah Tiket */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Jumlah Tiket yang ingin dikompensasi <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 gap-1 font-medium">
                  <span>*Contoh : 1 Tiket</span>
                  <span className="text-amber-700 font-bold">*Maksimal 10 Tiket per pengajuan</span>
                </div>
                <input
                  type="text"
                  required
                  value={ticketCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTicketCount(val);
                    const num = parseInt(val.replace(/\D/g, ''), 10) || 0;
                    if (num > 10) {
                      setErrorMsg('Jumlah tiket melebihi batas maksimal (Maksimal 10 Tiket per pengajuan).');
                    } else if (errorMsg.includes('Maksimal 10 Tiket')) {
                      setErrorMsg('');
                    }
                  }}
                  placeholder="Your answer"
                  className={`w-full px-3 py-2 text-sm border-b focus:outline-none bg-transparent transition-colors ${
                    (parseInt(ticketCount.replace(/\D/g, ''), 10) || 0) > 10
                      ? 'border-red-500 text-red-600 font-bold focus:border-red-600'
                      : 'border-zinc-300 focus:border-zinc-900'
                  }`}
                />
                {(parseInt(ticketCount.replace(/\D/g, ''), 10) || 0) > 10 && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    ⚠️ Jumlah tiket yang diisi melebihi batas (Maksimal 10 Tiket per pengajuan).
                  </p>
                )}
              </div>


              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={loading || uploadingKtp || uploadingTicket}
                  className="px-7 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:underline"
                >
                  Clear form
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
