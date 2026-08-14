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
      <div className="w-full max-w-4xl sm:max-w-5xl md:max-w-6xl mx-auto mt-8 sm:mt-12 px-2 sm:px-4">
        <Link
          href="/kompensasi"
          onClick={() => triggerCompensationClickPixels(config.compensationTitle)}
          className="group relative overflow-hidden block rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-emerald-950 p-6 sm:p-10 md:p-12 text-white border border-emerald-500/40 shadow-2xl shadow-emerald-950/40 hover:shadow-emerald-900/50 hover:border-emerald-400/70 transition-all duration-300 cursor-pointer text-left"
        >
          {/* Ambient Glow Background */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/30 transition-all" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 relative z-10">
            <div className="flex items-start sm:items-center gap-5 sm:gap-6 text-left min-w-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                <Gift className="w-7 h-7 sm:w-10 sm:h-10 text-emerald-400" />
              </div>
              <div className="min-w-0 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wider bg-emerald-500/20 px-3.5 py-1 rounded-full border border-emerald-500/30">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Layanan Penukaran Kompensasi Tiket</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                  {config.compensationTitle || 'Kompensasi Tiket Playlist Live Super Festival 2024'}
                </h3>
                <p className="text-xs sm:text-base md:text-lg text-zinc-300 leading-relaxed max-w-3xl">
                  {config.compensationSubtitle || 'Kompensasi berupa Discount 50% dari harga PRESALE 1 - FESTIVAL 2 DAY PASS pada event Playlist Rewind Festival 2026'}
                </p>
              </div>
            </div>

            <div className="self-stretch lg:self-center px-8 sm:px-10 py-4 sm:py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-base sm:text-lg md:text-xl rounded-2xl shadow-xl shadow-emerald-950/50 transition-all shrink-0 flex items-center justify-center gap-3 group-hover:scale-105 active:scale-95 cursor-pointer">
              <span>Klaim Kompensasi</span>
              <ArrowRight className="w-6 h-6" />
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
