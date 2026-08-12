'use client';

import React, { useState } from 'react';
import { SiteConfig } from '@/lib/config';
import { AffiliateSection } from './AffiliateSection';
import { AffiliateModal } from './AffiliateModal';
import { triggerAffiliateClickPixels } from '@/lib/pixels';
import { Users } from 'lucide-react';

interface AffiliateClientWrapperProps {
  config: SiteConfig;
  renderButtonOnly?: boolean;
}

export function AffiliateClientWrapper({ config, renderButtonOnly }: AffiliateClientWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!config.showAffiliateSection) {
    return null;
  }

  const handleOpenModal = () => {
    triggerAffiliateClickPixels();
    setIsModalOpen(true);
  };

  if (renderButtonOnly) {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F5F5F7] hover:bg-white text-zinc-950 font-medium text-xs sm:text-sm tracking-tight shadow-[0_4px_15px_rgba(0,0,0,0.04)] hover:shadow-md border border-zinc-200/90 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Users className="w-4 h-4 text-zinc-700" />
          <span>{config.affiliateButtonText || 'Daftar Affiliate Playlist'}</span>
        </button>

        <AffiliateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={config.affiliateTitle}
          subtitle={config.affiliateSubtitle}
        />
      </>
    );
  }

  return (
    <>
      <AffiliateSection
        onOpenModal={handleOpenModal}
        title={config.affiliateTitle}
        subtitle={config.affiliateSubtitle}
        buttonText={config.affiliateButtonText}
      />

      <AffiliateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={config.affiliateTitle}
        subtitle={config.affiliateSubtitle}
      />
    </>
  );
}
