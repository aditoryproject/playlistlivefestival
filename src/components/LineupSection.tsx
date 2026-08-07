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

        {/* Artist Logo Cards Grid - Clean Apple minimalist white design */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {currentArtists.map((artist) => {
            const rawLogoSrc = artist.logoUrl || artist.image;
            const isFailed = failedLogos[artist.id];
            const logoSrc = (!isFailed && rawLogoSrc) ? rawLogoSrc : null;

            return (
              <div
                key={artist.id}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-zinc-50/90 border border-zinc-200/80 shadow-lg shadow-zinc-200/40 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[130px] sm:min-h-[150px] hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer"
              >
                {/* Subtle hover highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={artist.name}
                    onError={() => handleImageError(artist.id)}
                    className="max-h-16 sm:max-h-20 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center px-2">
                    <span className="text-base sm:text-lg font-black tracking-tight text-zinc-950 uppercase font-sans leading-snug group-hover:text-pink-600 transition-colors">
                      {artist.name}
                    </span>
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
