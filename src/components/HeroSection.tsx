'use client';

import React from 'react';
import BuyNowButton from './BuyNowButton';
import { SiteConfig } from '@/lib/config';
import { Sparkles, MapPin, Calendar } from 'lucide-react';



interface HeroSectionProps {
  config: SiteConfig;
}

export default function HeroSection({ config }: HeroSectionProps) {
  return (
    <section className="pt-10 sm:pt-16 pb-8 sm:pb-12 px-4 relative overflow-hidden bg-white text-zinc-900">
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center space-y-5 sm:space-y-8">
        
        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-zinc-600">
          <span>Festival Experience by</span>
          <span className="bg-black text-white px-2 py-0.5 rounded font-black tracking-tighter text-xs uppercase">
            PLAYMAKER!
          </span>
        </div>

        {/* Ticket Availability Badge */}
        {config.showTicketStatus && config.ticketStatusText && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs sm:text-sm font-medium text-zinc-700 shadow-xs">
            <span>{config.ticketStatusText}</span>
          </div>
        )}

        {/* LOGO SECTION - Responsive to all screen widths */}
        <div className="flex items-center justify-center gap-1.5 min-[380px]:gap-2 sm:gap-3 flex-wrap">
          {/* "Playlist" with Gradient */}
          <span className="text-3xl min-[380px]:text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight bg-gradient-to-r from-[#DB5494] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
            {config.eventTitleFirst}
          </span>

          {/* Rewind Icon Circle - Black ring with rewind arrows inside */}
          <div className="inline-flex items-center justify-center w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-11 sm:h-11 rounded-full border-2 border-zinc-950 bg-white text-zinc-950 shrink-0 mx-0.5 sm:mx-1 shadow-2xs">
            <svg
              className="w-3.5 h-3.5 min-[380px]:w-4 min-[380px]:h-4 sm:w-5 sm:h-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M11 19V5l-9 7 9 7zm11 0V5l-9 7 9 7z" />
            </svg>
          </div>

          {/* "Rewind 2026" */}
          <span className="text-3xl min-[380px]:text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-zinc-950">
            {config.eventTitleSecond}
          </span>
        </div>

        {/* SUBTITLE SECTION */}
        <p className="text-base min-[380px]:text-lg sm:text-xl md:text-2xl text-zinc-600 font-normal tracking-tight max-w-2xl px-2">
          {config.eventSubtitle}
        </p>

        {/* BUY NOW BUTTON */}
        <div className="pt-3 sm:pt-6">
          <BuyNowButton
            ticketUrl={config.ticketUrl}
            buttonText={config.buyButtonText}
            eventTitle={`${config.eventTitleFirst} ${config.eventTitleSecond}`}
            enableSound={config.showSoundEffects}
          />
        </div>
      </div>
    </section>
  );
}

