'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  Trash2,
  MessageSquare,
  AlertCircle,
  Clock,
  Lock,
} from 'lucide-react';
import {
  triggerCompensationSubmitPixels,
  triggerJoinCompensationWaGroupPixels,
} from '@/lib/pixels';
import { SiteConfig } from '@/lib/config';

interface CompensationFormContentProps {
  config: SiteConfig;
  showCountdown?: boolean;
  targetDate?: string;
}

export default function CompensationFormContent({
  config,
  showCountdown,
  targetDate,
}: CompensationFormContentProps) {
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

  // Submission states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [waGroupUrl, setWaGroupUrl] = useState(config.compensationWaGroupUrl || 'https://chat.whatsapp.com/');

  // Countdown timer state
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!showCountdown || !targetDate) return;

    const calculateTime = () => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff <= 0) {
        setIsExpired(true);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [showCountdown, targetDate]);

  if (isExpired) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-zinc-200 shadow-md">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
          Waktu Pendaftaran Kompensasi Telah Berakhir
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Mohon maaf, batas waktu pendaftaran kompensasi tiket telah melewati tenggat waktu yang ditentukan.
        </p>
      </div>
    );
  }

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
      setErrorMsg('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Alamat Email wajib diisi.');
      return;
    }
    if (!ticketProofUrl) {
      setErrorMsg('Upload Bukti E-Tiket wajib diunggah.');
      return;
    }
    if (!ticketCount.trim()) {
      setErrorMsg('Jumlah Tiket wajib diisi.');
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

      triggerCompensationSubmitPixels(config.compensationTitle || 'Compensation Submission');

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Optional Countdown Bar */}
      {showCountdown && targetDate && !isExpired && (
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Batas Waktu Pengajuan Kompensasi
                </p>
                <p className="text-[11px] text-zinc-300">Form akan otomatis ditutup saat timer berakhir</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Hari', val: timeLeft.days },
                { label: 'Jam', val: timeLeft.hours },
                { label: 'Menit', val: timeLeft.minutes },
                { label: 'Detik', val: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-xl">
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-zinc-400 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {submitted ? (
        /* SUCCESS STATE */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-lg border border-zinc-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Pengajuan Kompensasi Berhasil!</h2>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
            Terima kasih <strong className="text-zinc-900">{fullName}</strong>. Data dan dokumen kompensasi Anda telah berhasil kami terima dan tersimpan secara aman.
          </p>

          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-2xl text-left space-y-2">
            <p className="font-bold text-emerald-950">Status Verifikasi:</p>
            <p>
              Tim kami akan memverifikasi data pembelian tiket Anda. Konfirmasi kompensasi diskon 50% akan dikirimkan ke WhatsApp & Email yang Anda cantumkan.
            </p>
          </div>
        </div>

      ) : (
        /* FORM STATE */
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 border border-zinc-200 text-xs text-red-600 font-semibold shadow-xs">
            * Indicates required question
          </div>

          {/* 1. Nama Lengkap */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-2">
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
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-2">
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
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-3">
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
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 cursor-pointer transition-all">
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

          {/* 4. WhatsApp & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-2">
              <label className="block text-sm font-bold text-zinc-900">
                Nomor WhatsApp Active <span className="text-red-500">*</span>
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

            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-2">
              <label className="block text-sm font-bold text-zinc-900">
                Alamat Email Active <span className="text-red-500">*</span>
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
          </div>

          {/* 5. Upload Bukti E-Tiket */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-3">
            <div>
              <label className="block text-sm font-bold text-zinc-900 leading-snug">
                Upload Bukti E-Tiket Pembelian Tiket Playlist Live Super Festival 2024 <span className="text-red-500">*</span>
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
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 cursor-pointer transition-all">
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

          {/* 6. Jumlah Tiket */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-2">
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


          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading || uploadingKtp || uploadingTicket}
              className="px-8 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Kompensasi
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
  );
}
