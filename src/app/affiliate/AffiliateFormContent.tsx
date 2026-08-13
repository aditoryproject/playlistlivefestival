'use client';

import React, { useState, useEffect } from 'react';
import {
  triggerAffiliateSubmitPixels,
  triggerJoinWaGroupPixels,
} from '@/lib/pixels';
import {
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
  Briefcase,
  Clock,
  Lock,
} from 'lucide-react';
import { SiteConfig } from '@/lib/config';

interface AffiliateFormContentProps {
  config: SiteConfig;
  showCountdown?: boolean;
  targetDate?: string;
}

export default function AffiliateFormContent({
  config,
  showCountdown,
  targetDate,
}: AffiliateFormContentProps) {
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
  const [waGroupUrl, setWaGroupUrl] = useState(config.affiliateWaGroupUrl || 'https://chat.whatsapp.com/');

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
          Waktu Pendaftaran Affiliate Telah Berakhir
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Mohon maaf, batas waktu pendaftaran program affiliate telah melewati tenggat waktu yang ditentukan.
        </p>
      </div>
    );
  }

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
        triggerAffiliateSubmitPixels(config.affiliateTitle || 'Affiliate Registration');
        setStep(3);
      } else {
        setErrorMsg(data.error || 'Gagal mengirim pendaftaran. Silakan coba lagi.');
      }
    } catch (err) {
      setErrorMsg('Terjadi masalah jaringan. Silakan periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaClick = () => {
    triggerJoinWaGroupPixels(config.affiliateTitle || 'Affiliate WA Group');
  };

  return (
    <div className="space-y-6">
      {/* Optional Countdown Bar */}
      {showCountdown && targetDate && !isExpired && (
        <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-zinc-950 border border-purple-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Batas Waktu Pendaftaran Affiliate
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
                  <span className="text-lg font-black font-mono text-purple-400">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-zinc-400 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DB5494] via-[#8B5CF6] to-[#3B82F6]" />

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto px-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step >= 1
                  ? 'bg-zinc-950 text-white ring-4 ring-zinc-950/10'
                  : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-semibold text-zinc-600 mt-1">Data Diri</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 transition-colors ${step >= 2 ? 'bg-zinc-950' : 'bg-zinc-200'}`} />

          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step >= 2
                  ? 'bg-zinc-950 text-white ring-4 ring-zinc-950/10'
                  : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-semibold text-zinc-600 mt-1">Profil & Sosmed</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 transition-colors ${step === 3 ? 'bg-emerald-600' : 'bg-zinc-200'}`} />

          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
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

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4 max-w-lg mx-auto">
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

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmitForm} className="space-y-4 max-w-lg mx-auto">
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
                  rows={3}
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

        {/* Step 3 */}
        {step === 3 && (
          <div className="text-center py-4 space-y-6 max-w-lg mx-auto animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-zinc-950">Pendaftaran Berhasil!</h3>
              <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Terima kasih <strong className="text-zinc-950">{fullName}</strong>! Data Anda telah terdaftar dalam program affiliate Playlist Rewind 2026.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-left text-xs text-zinc-600 space-y-2">
              <p className="font-bold text-zinc-900">Langkah Selanjutnya:</p>
              <p>
                Silakan bergabung ke **Group WhatsApp Official Affiliate** di bawah ini untuk mendapatkan brief materi promosi & komisi Anda.
              </p>
            </div>

            <a
              href={waGroupUrl}
              onClick={handleJoinWaClick}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-md flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Gabung WA Group Affiliate
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
