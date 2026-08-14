'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
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

interface CompensationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  showStartCountdown?: boolean;
  startDate?: string;
  showCountdown?: boolean;
  targetDate?: string;
}

export function CompensationModal({
  isOpen,
  onClose,
  title,
  subtitle,
  showStartCountdown,
  startDate,
  showCountdown,
  targetDate,
}: CompensationModalProps) {
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

  // Start countdown state (Belum Dibuka / Teaser)
  const [isNotStartedYet, setIsNotStartedYet] = useState(false);
  const [startLeft, setStartLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Deadline countdown state (Batas Penutupan)
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimes = () => {
      const now = +new Date();

      // 1. Check Start Date (Belum Dibuka / Teaser)
      if (showStartCountdown && startDate) {
        const startDiff = +new Date(startDate) - now;
        if (startDiff > 0) {
          setIsNotStartedYet(true);
          setStartLeft({
            days: Math.floor(startDiff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((startDiff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((startDiff / 1000 / 60) % 60),
            seconds: Math.floor((startDiff / 1000) % 60),
          });
        } else {
          setIsNotStartedYet(false);
        }
      } else {
        setIsNotStartedYet(false);
      }

      // 2. Check Target Date (Sudah Ditutup / Expired)
      if (showCountdown && targetDate) {
        const targetDiff = +new Date(targetDate) - now;
        if (targetDiff <= 0) {
          setIsExpired(true);
        } else {
          setIsExpired(false);
          setTimeLeft({
            days: Math.floor(targetDiff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((targetDiff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((targetDiff / 1000 / 60) % 60),
            seconds: Math.floor((targetDiff / 1000) % 60),
          });
        }
      } else {
        setIsExpired(false);
      }
    };

    calculateTimes();
    const timer = setInterval(calculateTimes, 1000);
    return () => clearInterval(timer);
  }, [showStartCountdown, startDate, showCountdown, targetDate]);

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
          {isNotStartedYet ? (
            /* NOT STARTED YET / START COUNTDOWN TEASER STATE */
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center space-y-5 border border-zinc-200 shadow-xs my-2">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  Pendaftaran Belum Dibuka
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                  Formulir Kompensasi Tiket Segera Dibuka
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Pengajuan klaim kompensasi tiket akan resmi dibuka pada tanggal{' '}
                  <strong className="text-zinc-900">
                    {startDate ? new Date(startDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : ''} WIB
                  </strong>. Silakan persiapkan KTP & Bukti E-Tiket Anda.
                </p>
              </div>

              {/* Countdown Box */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-emerald-950 p-5 rounded-2xl text-white shadow-md max-w-md mx-auto space-y-2">
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Hitung Mundur Pembukaan Form:
                </p>
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  {[
                    { label: 'Hari', val: startLeft.days },
                    { label: 'Jam', val: startLeft.hours },
                    { label: 'Menit', val: startLeft.minutes },
                    { label: 'Detik', val: startLeft.seconds },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white/10 border border-white/15 px-2.5 py-1.5 rounded-xl">
                      <span className="text-lg sm:text-xl font-black font-mono text-emerald-300">
                        {String(item.val).padStart(2, '0')}
                      </span>
                      <span className="block text-[8px] text-zinc-300 uppercase">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Tutup Halaman
                </button>
              </div>
            </div>
          ) : isExpired ? (
            /* EXPIRED STATE */
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center space-y-4 border border-zinc-200 shadow-xs my-2">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">
                Pendaftaran Kompensasi Tiket Ditutup
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                Mohon maaf, batas waktu pendaftaran kompensasi tiket telah berakhir.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Tutup Halaman
                </button>
              </div>
            </div>
          ) : submitted ? (
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
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-2 hover:border-zinc-300 transition-colors">
                <label className="block text-xs sm:text-sm font-bold text-zinc-900">
                  Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 text-xs sm:text-sm border-b border-zinc-300 focus:border-emerald-600 focus:outline-none bg-transparent transition-colors font-medium text-zinc-900"
                />
              </div>

              {/* 2. Nomor Identitas */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-2 hover:border-zinc-300 transition-colors">
                <label className="block text-xs sm:text-sm font-bold text-zinc-900">
                  Nomor Identitas (KTP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  placeholder="Contoh: 3273123456780001"
                  className="w-full px-3 py-2 text-xs sm:text-sm border-b border-zinc-300 focus:border-emerald-600 focus:outline-none bg-transparent transition-colors font-medium text-zinc-900"
                />
              </div>

              {/* 3. Upload KTP */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-3 hover:border-zinc-300 transition-colors">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900">
                    Upload Foto KTP <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Format: Gambar (JPG, PNG, WEBP) atau PDF. Maksimal 10 MB.</p>
                </div>

                {ktpImageUrl ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
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
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 cursor-pointer transition-all active:scale-98">
                    {uploadingKtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                        <span>Mengunggah KTP...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Pilih / Upload File KTP</span>
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
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-2 hover:border-zinc-300 transition-colors">
                <label className="block text-xs sm:text-sm font-bold text-zinc-900">
                  Nomor WhatsApp (Wajib Aktif) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 text-xs sm:text-sm border-b border-zinc-300 focus:border-emerald-600 focus:outline-none bg-transparent transition-colors font-medium text-zinc-900"
                />
              </div>

              {/* 5. Alamat Email */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-2 hover:border-zinc-300 transition-colors">
                <label className="block text-xs sm:text-sm font-bold text-zinc-900">
                  Alamat Email (Wajib Aktif) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: budi@gmail.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm border-b border-zinc-300 focus:border-emerald-600 focus:outline-none bg-transparent transition-colors font-medium text-zinc-900"
                />
              </div>

              {/* 6. Upload Bukti E-Tiket */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-3 hover:border-zinc-300 transition-colors">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
                    Upload Bukti E-Tiket Pembelian Tiket 2024 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Upload screenshot email E-Tiket atau file PDF tiket 2024. Maksimal 10 MB.</p>
                </div>

                {ticketProofUrl ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
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
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 cursor-pointer transition-all active:scale-98">
                    {uploadingTicket ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                        <span>Mengunggah E-Tiket...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Pilih / Upload Bukti E-Tiket</span>
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
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-3 hover:border-zinc-300 transition-colors">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900">
                    Jumlah Tiket yang Ingin Dikompensasi <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Maksimal 10 Tiket per pengajuan.</p>
                </div>

                {/* Quick Select Preset Pills for Mobile Ease */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {['1 Tiket', '2 Tiket', '3 Tiket', '4 Tiket', '5 Tiket'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setTicketCount(preset);
                        setErrorMsg('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        ticketCount === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
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
                  placeholder="Atau ketik sendiri, misal: 2 Tiket"
                  className={`w-full px-3 py-2 text-xs sm:text-sm border-b focus:outline-none bg-transparent transition-colors font-medium ${
                    (parseInt(ticketCount.replace(/\D/g, ''), 10) || 0) > 10
                      ? 'border-red-500 text-red-600 font-bold focus:border-red-600'
                      : 'border-zinc-300 focus:border-emerald-600 text-zinc-900'
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
