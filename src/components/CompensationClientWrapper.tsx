'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteConfig } from '@/lib/config';
import { CompensationSection } from './CompensationSection';
import { CompensationModal } from './CompensationModal';
import { triggerCompensationClickPixels } from '@/lib/pixels';
import { Gift, Sparkles, ArrowRight } from 'lucide-react';

interface CompensationClientWrapperProps {
  config: SiteConfig;
  renderButtonOnly?: boolean;
  renderBannerOnly?: boolean;
}

export function CompensationClientWrapper({
  config,
  renderButtonOnly,
  renderBannerOnly,
}: CompensationClientWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!config.showCompensationSection) {
    return null;
  }

  const handleOpenModal = () => {
    triggerCompensationClickPixels(config.compensationTitle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (renderBannerOnly) {
    if (config.showCompensationHeroBanner === false) return null;

    return (
      <div className="w-full max-w-md mx-auto mt-5 sm:mt-7 px-2">
        <Link
          href="/kompensasi"
          onClick={() => triggerCompensationClickPixels(config.compensationTitle)}
          className="group relative overflow-hidden block rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-emerald-950 p-4 sm:p-4.5 text-white border border-emerald-500/30 shadow-lg shadow-emerald-950/20 hover:shadow-emerald-900/30 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 text-left min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full mb-1 border border-emerald-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Layanan Kompensasi Tiket</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                  {config.compensationTitle || 'Kompensasi Tiket Playlist 2024'}
                </h4>
                <p className="text-[11px] text-zinc-300 truncate mt-0.5">
                  {config.compensationSubtitle || 'Klaim Diskon 50% untuk Pemegang Tiket 2024'}
                </p>
              </div>
            </div>

            <div className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs rounded-2xl shadow-md transition-all shrink-0 flex items-center gap-1 group-hover:scale-105 active:scale-95">
              <span>Klaim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (renderButtonOnly) {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-zinc-900 to-emerald-950 hover:from-zinc-800 hover:to-emerald-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-emerald-800/40"
        >
          <span>{config.compensationButtonText || 'Klaim Kompensasi Tiket'}</span>
        </button>

        <CompensationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={config.compensationTitle}
          subtitle={config.compensationSubtitle}
          showStartCountdown={Boolean(config.showCompensationStartCountdown)}
          startDate={config.compensationStartDate || ''}
          showCountdown={Boolean(config.showCompensationCountdown)}
          targetDate={config.compensationTargetDate || ''}
        />
      </>
    );
  }

  return (
    <>
      <CompensationSection
        onOpenModal={handleOpenModal}
        title={config.compensationTitle}
        subtitle={config.compensationSubtitle}
        buttonText={config.compensationButtonText}
      />

      <CompensationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={config.compensationTitle}
        subtitle={config.compensationSubtitle}
        showStartCountdown={Boolean(config.showCompensationStartCountdown)}
        startDate={config.compensationStartDate || ''}
        showCountdown={Boolean(config.showCompensationCountdown)}
        targetDate={config.compensationTargetDate || ''}
      />
    </>
  );
}
