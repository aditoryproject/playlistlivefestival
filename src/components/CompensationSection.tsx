'use client';

import React from 'react';
import { Ticket, ShieldCheck, Gift, ArrowRight } from 'lucide-react';

interface CompensationSectionProps {
  onOpenModal: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export function CompensationSection({
  onOpenModal,
  title,
  subtitle,
  buttonText,
}: CompensationSectionProps) {
  return (
    <section className="relative py-10 sm:py-14 px-4 bg-white text-zinc-900">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-emerald-950 border border-emerald-900/30 p-8 sm:p-12 shadow-xl shadow-zinc-950/20 text-white overflow-hidden relative">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="flex justify-center md:justify-start mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Ticket className="w-3.5 h-3.5 text-emerald-400" />
              Layanan Penukaran Kompensasi
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-8 text-center md:text-left space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                {title || 'Kompensasi Tiket Playlist Live Super Festival 2024'}
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                {subtitle ||
                  'Kompensasi berupa Discount 50% dari harga PRESALE 1 - FESTIVAL 2 DAY PASS pada event Playlist Rewind Festival 2026'}
              </p>

              {/* Benefits Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3 backdrop-blur-sm">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Diskon Khusus 50%</p>
                    <p className="text-[11px] text-zinc-300">Khusus pemegang tiket 2024</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3 backdrop-blur-sm">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Proses Verifikasi Resmi</p>
                    <p className="text-[11px] text-zinc-300">Data tersimpan rapi & aman</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action CTA */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center pt-4 lg:pt-0">
              <button
                onClick={onOpenModal}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{buttonText || 'Klaim Kompensasi Tiket'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
