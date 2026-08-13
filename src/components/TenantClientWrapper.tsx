'use client';

import React, { useState } from 'react';
import { SiteConfig } from '@/lib/config';
import { TenantSection } from './TenantSection';
import { TenantModal } from './TenantModal';
import { triggerTenantClickPixels } from '@/lib/pixels';
import { Utensils } from 'lucide-react';

interface TenantClientWrapperProps {
  config: SiteConfig;
  renderButtonOnly?: boolean;
}

export function TenantClientWrapper({ config, renderButtonOnly }: TenantClientWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!config.showTenantSection) {
    return null;
  }

  const handleOpenModal = () => {
    triggerTenantClickPixels();
    setIsModalOpen(true);
  };

  if (renderButtonOnly) {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm tracking-tight shadow-xs border border-amber-200 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Utensils className="w-4 h-4 text-amber-700" />
          <span>{config.tenantButtonText || 'Daftar Tenant F&B'}</span>
        </button>

        <TenantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={config.tenantTitle}
          subtitle={config.tenantSubtitle}
        />
      </>
    );
  }

  return (
    <>
      <TenantSection
        onOpenModal={handleOpenModal}
        title={config.tenantTitle}
        subtitle={config.tenantSubtitle}
        buttonText={config.tenantButtonText}
      />

      <TenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={config.tenantTitle}
        subtitle={config.tenantSubtitle}
      />
    </>
  );
}
