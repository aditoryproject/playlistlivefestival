'use client';

import React, { useState } from 'react';
import { Artist, LineupPhase } from '@/lib/config';

interface LineupSectionProps {
  lineup: Artist[];
  phases?: LineupPhase[];
  activePhaseId?: string;
}

export default function LineupSection({
  lineup,
  phases = [
    { id: 'phase-1', name: 'Phase 1', title: 'Phase 1 Lineup', active: true },
    { id: 'phase-2', name: 'Phase 2', title: 'Phase 2 Lineup', active: false },
  ],
  activePhaseId = 'phase-1',
}: LineupSectionProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(
    activePhaseId || (phases.length > 0 ? phases[0].id : 'phase-1')
  );
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const handleImageError = (artistId: string) => {
    setFailedLogos((prev) => ({ ...prev, [artistId]: true }));
  };

  // Filter artists by phase if phaseId is defined, otherwise show all
  const currentArtists = lineup.filter((artist) => {
    if (!artist.phaseId) return true;
    return artist.phaseId === selectedPhaseId;
  });

  return (
    <section className="pt-4 sm:pt-8 pb-20 px-4 bg-white text-zinc-900">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* Phase Selector Badge / Pill Tabs */}
        {phases && phases.length === 1 && (
          <div className="inline-flex items-center gap-1.5 px-8 py-3 rounded-full bg-zinc-50/90 border border-zinc-200/80 shadow-xs mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-[#DB5494] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent font-black text-xl sm:text-2xl">
              Phase
            </span>
            <span className="text-zinc-950 font-black text-xl sm:text-2xl ml-1">
              {phases[0].name.replace(/phase/i, '').trim() || '1'}
            </span>
            <span className="text-zinc-800 font-semibold ml-1.5 text-lg sm:text-xl">
              Lineup
            </span>
          </div>
        )}

        {phases && phases.length > 1 && (
          <div className="inline-flex items-center justify-center gap-2 p-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/80 shadow-xs mb-10 max-w-full overflow-x-auto">
            {phases.map((phase) => {
              const isSelected = selectedPhaseId === phase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => setSelectedPhaseId(phase.id)}
                  className={`px-6 py-2.5 rounded-full text-base sm:text-xl font-bold transition-all duration-300 flex items-center gap-1 whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-zinc-900 shadow-md scale-105 border border-zinc-200/60'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <span className="bg-gradient-to-r from-[#DB5494] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent font-black">
                    Phase
                  </span>
                  <span className="text-zinc-950 font-black text-xl ml-1">
                    {phase.name.replace(/phase/i, '').trim() || '1'}
                  </span>
                  <span className="text-zinc-800 font-semibold ml-1.5 text-base sm:text-lg">
                    Lineup
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Artist Logo Cards Bento Grid - Inspired by PLF26 Poster Layout */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 md:gap-5 auto-rows-[115px] sm:auto-rows-[135px] md:auto-rows-[150px]">
          {currentArtists.map((artist) => {
            const rawLogoSrc = artist.logoUrl || artist.image;
            const isFailed = failedLogos[artist.id];
            const logoSrc = (!isFailed && rawLogoSrc) ? rawLogoSrc : null;
            const displayName = (artist.name && artist.name.trim().length > 0) ? artist.name.trim() : 'ARTIST';

            // Determine bento grid span classes based on artist.cardSize
            const cardSize = artist.cardSize || 'normal';
            let spanClasses = 'col-span-1 row-span-1';
            let imgSizeClass = 'max-h-12 sm:max-h-16 md:max-h-18';

            if (cardSize === 'extrawide') {
              spanClasses = 'col-span-2 sm:col-span-4 md:col-span-3 row-span-1';
              imgSizeClass = 'max-h-16 sm:max-h-20 md:max-h-24';
            } else if (cardSize === 'large') {
              spanClasses = 'col-span-2 row-span-2';
              imgSizeClass = 'max-h-28 sm:max-h-36 md:max-h-44';
            } else if (cardSize === 'wide') {
              spanClasses = 'col-span-2 row-span-1';
              imgSizeClass = 'max-h-14 sm:max-h-18 md:max-h-20';
            }

            return (
              <div
                key={artist.id}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-white to-zinc-50/90 border border-zinc-200/90 shadow-md shadow-zinc-200/40 p-4 sm:p-6 flex flex-col items-center justify-center hover:shadow-xl hover:scale-[1.02] hover:border-pink-300/80 transition-all duration-300 cursor-pointer ${spanClasses}`}
              >
                {/* Subtle shine / hover highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={displayName}
                    onError={() => handleImageError(artist.id)}
                    className={`${imgSizeClass} max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300`}
                  />
                ) : (
                  <div className="text-center px-2">
                    <span
                      className={`font-black tracking-tight text-zinc-950 uppercase font-sans leading-snug group-hover:text-pink-600 transition-colors ${
                        cardSize === 'large'
                          ? 'text-2xl sm:text-4xl'
                          : cardSize === 'extrawide'
                          ? 'text-xl sm:text-3xl'
                          : cardSize === 'wide'
                          ? 'text-lg sm:text-2xl'
                          : 'text-sm sm:text-base'
                      }`}
                    >
                      {displayName}
                    </span>
                    {artist.genre && (
                      <span className="block text-[10px] sm:text-xs text-zinc-400 font-medium uppercase mt-1 tracking-wider">
                        {artist.genre}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentArtists.length === 0 && (
          <div className="py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 text-zinc-400 text-sm font-medium w-full">
            Belum ada logo artis di phase ini. Silakan tambahkan melalui Dashboard CMS Admin.
          </div>
        )}

      </div>
    </section>
  );
}
