'use client';

import React from 'react';
import { Sparkles, Users, Award, TrendingUp, ArrowRight } from 'lucide-react';

interface AffiliateSectionProps {
  onOpenModal: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export function AffiliateSection({
  onOpenModal,
  title,
  subtitle,
  buttonText,
}: AffiliateSectionProps) {
  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Background Decorator Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 md:p-12 shadow-2xl overflow-hidden">
          {/* Top Badge */}
          <div className="flex justify-center md:justify-start mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Program Kemitraan & Affiliate
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center md:text-left space-y-4">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
                {title || 'Gabung Program Affiliate Playlist Rewind 2026'}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                {subtitle ||
                  'Dapatkan komisi menarik dan akses eksklusif dengan menjadi bagian dari tim promo Playlist Rewind 2026! Bawa teman dan komunitasmu untuk hadir.'}
              </p>

              {/* Benefits Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Komisi Menarik</p>
                    <p className="text-[11px] text-slate-400">Per penjualan tiket</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">WA Group Eksklusif</p>
                    <p className="text-[11px] text-slate-400">Arahan & strategi</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Akses VVIP</p>
                    <p className="text-[11px] text-slate-400">Bonus & Merchandise</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right CTA Button */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              <button
                onClick={onOpenModal}
                className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base tracking-wide uppercase shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 group"
              >
                {buttonText || 'Daftar Affiliate Playlist'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-slate-400 mt-3 text-center lg:text-right">
                Pendaftaran cepat kurang dari 1 menit ⚡
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
