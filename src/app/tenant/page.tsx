import React from 'react';
import { getSiteConfigAsync } from '@/lib/config';
import VisitorTracker from '@/components/VisitorTracker';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Utensils, Sparkles, Lock } from 'lucide-react';
import TenantFormContent from './TenantFormContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  const config = await getSiteConfigAsync();
  return {
    title: `Pendaftaran Tenant F&B - ${config.eventTitleFirst} ${config.eventTitleSecond}`,
    description: config.tenantSubtitle || 'Open Recruitment Tenant F&B Playlist Rewind 2026 Bandung',
  };
}

export default async function TenantPage() {
  const config = await getSiteConfigAsync();

  const targetTime = config.tenantTargetDate ? new Date(config.tenantTargetDate).getTime() : 0;
  const now = Date.now();
  const isCountdownActive = Boolean(config.showTenantCountdown && targetTime > 0);
  const isExpired = isCountdownActive && now >= targetTime;
  const isOpen = config.showTenantSection && !isExpired;

  return (
    <main className="min-h-screen flex flex-col justify-between bg-zinc-50 text-zinc-900">
      <VisitorTracker />

      {/* Header Bar */}
      <header className="bg-zinc-950 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Main Website</span>
          </Link>

          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <span className="font-black text-sm tracking-tight text-white">
              {config.eventTitleFirst} {config.eventTitleSecond}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-zinc-950 via-amber-950 to-orange-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-900/50 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Open Recruitment Tenant F&B 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {config.tenantTitle || 'Open Recruitment Tenant F&B Playlist Rewind 2026'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {config.tenantSubtitle ||
              'Bergabunglah bersama puluhan ribu pengunjung di festival musik terbesar di Bandung!'}
          </p>
        </div>

        {/* Form or Closed Banner */}
        {!isOpen ? (
          /* CLOSED / EXPIRED STATE */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-zinc-200 shadow-md">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Pendaftaran Tenant F&B Ditutup
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              Mohon maaf, pendaftaran booth F&B untuk Playlist Rewind 2026 telah ditutup atau kuota booth telah terpenuhi.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : (
          /* ACTIVE FORM */
          <TenantFormContent
            config={config}
            showCountdown={Boolean(config.showTenantCountdown)}
            targetDate={config.tenantTargetDate || ''}
          />
        )}
      </div>

      <Footer eventTitle={`${config.eventTitleFirst} ${config.eventTitleSecond}`} />
    </main>
  );
}
