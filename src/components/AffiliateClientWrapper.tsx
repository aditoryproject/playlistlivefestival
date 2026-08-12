'use client';

import React, { useState } from 'react';
import { SiteConfig } from '@/lib/config';
import { AffiliateSection } from './AffiliateSection';
import { AffiliateModal } from './AffiliateModal';
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

  if (renderButtonOnly) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs sm:text-sm tracking-wide uppercase shadow-md transition-all border border-amber-500/30 hover:border-amber-500/60"
        >
          <Users className="w-4 h-4 text-amber-400" />
          {config.affiliateButtonText || 'Daftar Affiliate'}
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
        onOpenModal={() => setIsModalOpen(true)}
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
