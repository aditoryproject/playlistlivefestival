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
    <section className="relative py-12 sm:py-16 px-4 bg-white text-zinc-900">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-b from-white via-zinc-50/80 to-zinc-100/50 border border-zinc-200/90 p-8 sm:p-12 shadow-lg shadow-zinc-200/30 overflow-hidden">
          {/* Top Tag */}
          <div className="flex justify-center md:justify-start mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
              Program Kemitraan & Affiliate
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center md:text-left space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 leading-tight">
                {title || 'Gabung Program Affiliate Playlist Rewind 2026'}
              </h2>
              <p className="text-zinc-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
                {subtitle ||
                  'Dapatkan komisi menarik dan akses eksklusif dengan menjadi bagian dari tim promo Playlist Rewind 2026! Bawa teman dan komunitasmu untuk hadir.'}
              </p>

              {/* Benefits Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 text-zinc-800">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Komisi Menarik</p>
                    <p className="text-[11px] text-zinc-500">Per penjualan tiket</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 text-zinc-800">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">WA Group</p>
                    <p className="text-[11px] text-zinc-500">Arahan & strategi</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 text-zinc-800">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Reward Eksklusif</p>
                    <p className="text-[11px] text-zinc-500">Bonus & Merch</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right CTA Button */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              <button
                onClick={onOpenModal}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm sm:text-base tracking-wide uppercase shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <span>{buttonText || 'Daftar Affiliate Playlist'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-zinc-400 mt-2.5 text-center lg:text-right">
                Pendaftaran cepat kurang dari 1 menit ⚡
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
