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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl transition-all">
        {/* Glow Header Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors z-10"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header Info */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Program Official Affiliate
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {title || 'Gabung Affiliate Playlist'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {subtitle || 'Dapatkan komisi menarik & reward eksklusif untuk setiap tiket yang terjual!'}
            </p>
          </div>

          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-8 px-4">
            {/* Step 1 Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= 1
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1">Data Diri</span>
            </div>

            {/* Line 1-2 */}
            <div
              className={`flex-1 h-1 mx-2 rounded transition-colors ${
                step >= 2 ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            />

            {/* Step 2 Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= 2
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1">Profil & Sosmed</span>
            </div>

            {/* Line 2-3 */}
            <div
              className={`flex-1 h-1 mx-2 rounded transition-colors ${
                step === 3 ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            />

            {/* Step 3 Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === 3
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1">Selesai</span>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Data Utama */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Pratama"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Alamat Email (Opsional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Contoh: email@anda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 transition-all"
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
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username Instagram / TikTok
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Contoh: @username_anda"
                    value={instagramTiktok}
                    onChange={(e) => setInstagramTiktok(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Kota Domisili
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Bandung, Jakarta, dll."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pengalaman Promosi / Catatan Singkat
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="Ceritakan singkat pengalaman promosi / event kamu..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">Pendaftaran Berhasil!</h4>
                <p className="text-sm text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                  Terima kasih <strong className="text-amber-400">{fullName}</strong>! Data Anda telah terdaftar dalam program affiliate Playlist Rewind 2026.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs text-slate-300 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>Langkah berikutnya: Bergabunglah ke **Group WhatsApp Official Affiliate** di bawah ini untuk mendapatkan brief, materi promosi, dan kode referral Anda.</span>
                </div>
              </div>

              {/* Big CTA WhatsApp Group Button */}
              <a
                href={waGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm md:text-base tracking-wide uppercase shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 group"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                Gabung WA Group Affiliate
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={handleResetAndClose}
                className="text-xs text-slate-400 hover:text-slate-200 underline pt-2"
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
