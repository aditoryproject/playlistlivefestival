'use client';

import React, { useState } from 'react';
import { SiteConfig } from '@/lib/config';
import { CompensationSection } from './CompensationSection';
import { CompensationModal } from './CompensationModal';

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
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-800 to-zinc-900 hover:from-red-700 hover:to-zinc-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-red-700/50"
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
