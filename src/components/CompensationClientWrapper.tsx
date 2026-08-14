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
      <div className="w-full max-w-3xl sm:max-w-4xl mx-auto mt-6 sm:mt-10 px-2 sm:px-4">
        <Link
          href="/kompensasi"
          onClick={() => triggerCompensationClickPixels(config.compensationTitle)}
          className="group relative overflow-hidden block rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-emerald-950 p-6 sm:p-8 text-white border border-emerald-500/40 shadow-2xl shadow-emerald-950/30 hover:shadow-emerald-900/40 hover:border-emerald-400/60 transition-all duration-300 cursor-pointer"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 text-left min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                <Gift className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Layanan Penukaran Kompensasi Tiket</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight">
                  {config.compensationTitle || 'Kompensasi Tiket Playlist Live Super Festival 2024'}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {config.compensationSubtitle || 'Kompensasi berupa Discount 50% dari harga PRESALE 1 - FESTIVAL 2 DAY PASS'}
                </p>
              </div>
            </div>

            <div className="self-end sm:self-center px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-950/40 transition-all shrink-0 flex items-center gap-2 group-hover:scale-105 active:scale-95 cursor-pointer">
              <span>Klaim Kompensasi</span>
              <ArrowRight className="w-5 h-5" />
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
