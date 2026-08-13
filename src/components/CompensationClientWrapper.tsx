'use client';

import React, { useState } from 'react';
import { SiteConfig } from '@/lib/config';
import { CompensationSection } from './CompensationSection';
import { CompensationModal } from './CompensationModal';
import { triggerCompensationClickPixels } from '@/lib/pixels';

interface CompensationClientWrapperProps {
  config: SiteConfig;
  renderButtonOnly?: boolean;
}

export function CompensationClientWrapper({ config, renderButtonOnly }: CompensationClientWrapperProps) {
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
      />
    </>
  );
}
