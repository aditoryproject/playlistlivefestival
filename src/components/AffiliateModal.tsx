'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  AtSign,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Briefcase
} from 'lucide-react';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function AffiliateModal({ isOpen, onClose, title, subtitle }: AffiliateModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [instagramTiktok, setInstagramTiktok] = useState('');
  const [city, setCity] = useState('');
  const [experience, setExperience] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [waGroupUrl, setWaGroupUrl] = useState('https://chat.whatsapp.com/');

  if (!isOpen) return null;

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Silakan isi Nama Lengkap Anda.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 8) {
      setErrorMsg('Silakan isi nomor WhatsApp yang aktif.');
      return;
    }
    setStep(2);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          whatsapp,
          email,
          instagramTiktok,
          city,
          experience,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.waGroupUrl) {
          setWaGroupUrl(data.waGroupUrl);
        }
        setStep(3); // Move to final success step
      } else {
        setErrorMsg(data.error || 'Gagal mengirim pendaftaran. Silakan coba lagi.');
      }
    } catch (err) {
      setErrorMsg('Terjadi masalah jaringan. Silakan periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setFullName('');
    setWhatsapp('');
    setEmail('');
    setInstagramTiktok('');
    setCity('');
    setExperience('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white border border-zinc-200/80 text-zinc-900 shadow-2xl transition-all">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DB5494] via-[#8B5CF6] to-[#3B82F6]" />

        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors z-10"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header Info */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
              Program Official Affiliate
            </div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950">
              {title || 'Gabung Affiliate Playlist'}
            </h3>
            <p className="text-xs md:text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              {subtitle || 'Dapatkan komisi menarik & reward eksklusif untuk setiap tiket yang terjual!'}
            </p>
          </div>

          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-8 px-4">
            {/* Step 1 Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= 1
                    ? 'bg-zinc-950 text-white ring-4 ring-zinc-950/10'
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-semibold text-zinc-600 mt-1">Data Diri</span>
            </div>

            {/* Line 1-2 */}
            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                step >= 2 ? 'bg-zinc-950' : 'bg-zinc-200'
              }`}
            />

            {/* Step 2 Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= 2
                    ? 'bg-zinc-950 text-white ring-4 ring-zinc-950/10'
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-semibold text-zinc-600 mt-1">Profil & Sosmed</span>
            </div>

            {/* Line 2-3 */}
            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                step === 3 ? 'bg-emerald-600' : 'bg-zinc-200'
              }`}
            />

            {/* Step 3 Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === 3
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/10'
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-zinc-600 mt-1">Selesai</span>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Data Utama */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Pratama"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200/90 focus:border-zinc-950 focus:bg-white rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200/90 focus:border-zinc-950 focus:bg-white rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
                  Alamat Email (Opsional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="Contoh: email@anda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200/90 focus:border-zinc-950 focus:bg-white rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3.5 px-6 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg"
              >
                Lanjut ke Langkah 2
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 2: Profil & Sosial Media */}
          {step === 2 && (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
                  Username Instagram / TikTok
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Contoh: @username_anda"
                    value={instagramTiktok}
                    onChange={(e) => setInstagramTiktok(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200/90 focus:border-zinc-950 focus:bg-white rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
                  Kota Domisili
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Bandung, Jakarta, dll."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200/90 focus:border-zinc-950 focus:bg-white rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
                  Pengalaman Promosi / Catatan Singkat
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <textarea
                    rows={2}
                    placeholder="Ceritakan singkat pengalaman promosi / event kamu..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200/90 focus:border-zinc-950 focus:bg-white rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-xs sm:text-sm font-medium resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="py-3.5 px-5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-6 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Kirim Pendaftaran
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success Step & WA Group Link */}
          {step === 3 && (
            <div className="text-center py-3 space-y-5 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-zinc-950">Pendaftaran Berhasil!</h4>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  Terima kasih <strong className="text-zinc-950">{fullName}</strong>! Data Anda telah terdaftar dalam program affiliate Playlist Rewind 2026.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-left text-xs text-zinc-600 space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>Silakan bergabung ke **Group WhatsApp Official Affiliate** di bawah ini untuk mendapatkan brief materi promosi & komisi Anda.</span>
                </div>
              </div>

              {/* Clean WhatsApp Group Button */}
              <a
                href={waGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-md flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                Gabung WA Group Affiliate
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={handleResetAndClose}
                className="text-xs text-zinc-400 hover:text-zinc-700 underline pt-1 block mx-auto"
              >
                Tutup Jendela Ini
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
