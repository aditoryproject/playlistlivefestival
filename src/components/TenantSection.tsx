'use client';

import React from 'react';
import { triggerTenantClickPixels } from '@/lib/pixels';
import { Utensils, Sparkles, Users, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TenantSectionProps {
  onOpenModal: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export function TenantSection({
  onOpenModal,
  title,
  subtitle,
  buttonText,
}: TenantSectionProps) {
  const handleClick = () => {
    triggerTenantClickPixels();
    onOpenModal();
  };

  return (
    <section className="relative py-12 sm:py-16 px-4 bg-white text-zinc-900">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-b from-amber-50/60 via-zinc-50/80 to-zinc-100/50 border border-amber-200/90 p-8 sm:p-12 shadow-lg shadow-amber-900/5 overflow-hidden">
          {/* Top Badge */}
          <div className="flex justify-center md:justify-start mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold uppercase tracking-wider">
              <Utensils className="w-3.5 h-3.5 text-amber-700" />
              Open Recruitment Tenant F&B
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center md:text-left space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-950 leading-tight">
                {title || 'Open Recruitment Tenant F&B Playlist Rewind 2026'}
              </h2>
              <p className="text-zinc-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
                {subtitle ||
                  'Sajikan produk kuliner terbaik brand Anda di hadapan puluhan ribu pengunjung festival musik terbesar di Bandung!'}
              </p>

              {/* Benefits Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">High Traffic</p>
                    <p className="text-[11px] text-zinc-500">Puluhan Ribu Audiens</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Fasilitas Booth</p>
                    <p className="text-[11px] text-zinc-500">Listrik & Tenda</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Official Partner</p>
                    <p className="text-[11px] text-zinc-500">Promosi Brand</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center space-y-3">
              <button
                onClick={handleClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base tracking-wide uppercase shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <span>{buttonText || 'Daftar Tenant F&B'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/tenant"
                className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-4"
              >
                Atau Buka Halaman Khusus Form /tenant &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
