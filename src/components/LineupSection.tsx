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

  // Map artist array by name for quick lookup if rendering in exact poster grid sequence
  const artistMap = new Map<string, Artist>();
  currentArtists.forEach((a) => {
    artistMap.set(a.name.toLowerCase().trim(), a);
  });

  // Helper to render artist logo or stylized typography
  const renderArtistCard = (artist: Artist, customClasses: string) => {
    const rawLogoSrc = artist.logoUrl || artist.image;
    const isFailed = failedLogos[artist.id];
    const logoSrc = (!isFailed && rawLogoSrc) ? rawLogoSrc : null;
    const nameLower = artist.name.toLowerCase();

    return (
      <div
        key={artist.id}
        className={`group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-white to-zinc-50/90 border border-zinc-200/90 shadow-md shadow-zinc-200/40 p-4 sm:p-5 flex flex-col items-center justify-center hover:shadow-xl hover:scale-[1.02] hover:border-pink-300/80 transition-all duration-300 cursor-pointer ${customClasses}`}
      >
        {/* Subtle shine hover effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {logoSrc ? (
          <img
            src={logoSrc}
            alt={artist.name}
            onError={() => handleImageError(artist.id)}
            className="max-h-16 sm:max-h-24 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-center px-2 flex items-center justify-center">
            {/* Custom stylized logo font typography matching original poster */}
            {nameLower.includes('peterpan') && (
              <span className="font-sans font-black text-3xl sm:text-5xl text-zinc-950 lowercase tracking-tighter group-hover:text-pink-600 transition-colors">
                peterpan
              </span>
            )}
            {nameLower.includes('burgerkill') && (
              <span className="font-mono font-bold text-sm sm:text-lg tracking-widest text-zinc-900 uppercase group-hover:text-pink-600 transition-colors">
                &#123;BURGERKILL&#125;
              </span>
            )}
            {nameLower.includes('kotak') && (
              <span className="font-mono font-black text-lg sm:text-2xl tracking-[0.2em] text-zinc-950 uppercase group-hover:text-pink-600 transition-colors">
                KOTAX
              </span>
            )}
            {nameLower.includes('geisha') && (
              <span className="font-serif font-semibold text-xs sm:text-base tracking-[0.35em] text-zinc-900 uppercase group-hover:text-pink-600 transition-colors">
                G E I S H A
              </span>
            )}
            {nameLower.includes('perunggu') && (
              <span className="font-sans font-black text-sm sm:text-lg tracking-wider text-zinc-950 uppercase group-hover:text-pink-600 transition-colors">
                PERUNGGU
              </span>
            )}
            {nameLower.includes('enau') && (
              <span className="font-sans font-black text-xl sm:text-3xl text-zinc-950 lowercase group-hover:text-pink-600 transition-colors">
                eňau
              </span>
            )}
            {nameLower.includes('charly') && (
              <div className="text-center">
                <span className="block font-serif italic text-xs text-zinc-600">Charly</span>
                <span className="block font-sans font-black text-xs sm:text-sm tracking-wider uppercase text-zinc-950">SETIA BAND</span>
              </div>
            )}
            {nameLower.includes('gigi') && (
              <span className="font-serif italic font-black text-5xl sm:text-7xl text-zinc-950 tracking-tighter group-hover:text-pink-600 transition-colors leading-none">
                Gigi
              </span>
            )}
            {nameLower.includes('t-five') && (
              <span className="font-sans italic font-black text-lg sm:text-2xl text-zinc-950 tracking-tight group-hover:text-pink-600 transition-colors">
                t-Five
              </span>
            )}
            {nameLower.includes('armand') && (
              <span className="font-sans font-black text-xs sm:text-sm tracking-tighter text-zinc-950 uppercase group-hover:text-pink-600 transition-colors">
                ARMAND MAULANA
              </span>
            )}
            {nameLower.includes('rony') && (
              <span className="font-serif font-bold text-xs sm:text-sm tracking-wider text-zinc-950 uppercase leading-snug group-hover:text-pink-600 transition-colors">
                RONY<br />PARULIAN
              </span>
            )}
            {nameLower.includes('petto') || nameLower.includes('letto') && (
              <span className="font-sans font-black text-xs sm:text-sm bg-zinc-950 text-white rounded-full px-4 py-1.5 uppercase group-hover:bg-pink-600 transition-colors">
                Letto
              </span>
            )}
            {nameLower.includes('changcuters') && (
              <span className="font-serif font-black text-[10px] sm:text-xs tracking-widest text-zinc-950 uppercase group-hover:text-pink-600 transition-colors">
                THE CHANGCUTERS
              </span>
            )}
            {nameLower.includes('kangen') && (
              <span className="font-sans font-black text-xs sm:text-sm tracking-widest text-zinc-950 uppercase group-hover:text-pink-600 transition-colors">
                KANGEN BAND
              </span>
            )}
            {nameLower.includes('andra') && (
              <span className="font-serif font-semibold text-sm sm:text-xl tracking-wider text-zinc-950 uppercase group-hover:text-pink-600 transition-colors">
                ANDRA <span className="text-xs font-normal">AND THE</span> BACKBONE
              </span>
            )}

            {/* Fallback for any other custom artist added in CMS */}
            {!['peterpan', 'burgerkill', 'kotak', 'geisha', 'perunggu', 'enau', 'charly', 'gigi', 't-five', 'armand', 'rony', 'letto', 'changcuters', 'kangen', 'andra'].some(k => nameLower.includes(k)) && (
              <span className="font-black text-sm sm:text-lg text-zinc-950 uppercase">
                {artist.name}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="pt-4 sm:pt-8 pb-20 px-4 bg-white text-zinc-900">
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
        
        {/* Phase Selector Badge / Pill Tabs */}
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

        {/* Fixed 12-Column Compact Bento Grid Matching PLF26 Poster Layout */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-12 gap-2.5 sm:gap-3.5 md:gap-4 auto-rows-[90px] sm:auto-rows-[115px] md:auto-rows-[130px]">
          
          {/* ROW 1 */}
          {/* 1. peterpan (col 1 to 6 = 50% width) */}
          {renderArtistCard(artistMap.get('peterpan') || { id: '1', name: 'peterpan', cardSize: 'extrawide' }, 'col-span-6 row-span-1')}
          {/* 2. BURGERKILL (col 7 to 9 = 25% width) */}
          {renderArtistCard(artistMap.get('burgerkill') || { id: '2', name: 'BURGERKILL', cardSize: 'normal' }, 'col-span-3 row-span-1')}
          {/* 3. KOTAK (col 10 to 12 = 25% width) */}
          {renderArtistCard(artistMap.get('kotak') || { id: '3', name: 'KOTAK', cardSize: 'normal' }, 'col-span-3 row-span-1')}

          {/* ROW 2 */}
          {/* 4. GEISHA (col 1 to 2) */}
          {renderArtistCard(artistMap.get('geisha') || { id: '4', name: 'GEISHA', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* 5. PERUNGGU (col 3 to 4) */}
          {renderArtistCard(artistMap.get('perunggu') || { id: '5', name: 'PERUNGGU', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* 6. enau (col 5 to 6) */}
          {renderArtistCard(artistMap.get('enau') || { id: '6', name: 'enau', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* 7. Charly SETIA BAND (col 7 to 8) */}
          {renderArtistCard(artistMap.get('charly setia band') || { id: '7', name: 'Charly SETIA BAND', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* 8. Gigi (col 9 to 12, spans 2 rows) */}
          {renderArtistCard(artistMap.get('gigi') || { id: '8', name: 'Gigi', cardSize: 'large' }, 'col-span-4 row-span-2')}

          {/* ROW 3 */}
          {/* 9. SPECIAL TILE: All Lineup Phase 1 & 2 Text Box (col 1 to 6) */}
          <div className="col-span-6 row-span-1 rounded-2xl md:rounded-3xl bg-transparent p-3 sm:p-5 flex flex-col justify-center text-left">
            <span className="text-zinc-700 font-medium text-base sm:text-2xl tracking-tight leading-none mb-1">
              All Lineup
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="bg-gradient-to-r from-[#DB5494] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent font-black text-2xl sm:text-5xl leading-none">
                Phase
              </span>
              <span className="text-zinc-950 font-black text-2xl sm:text-5xl leading-none">
                1 & 2
              </span>
            </div>
          </div>
          {/* 10. t-Five (col 7 to 8) */}
          {renderArtistCard(artistMap.get('t-five') || { id: '9', name: 't-Five', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* Gigi occupies col 9 to 12 here */}

          {/* ROW 4 */}
          {/* 11. SPECIAL TILE: Vinyl 3D Disc Hologram Card (col 1 to 2) */}
          <div className="col-span-2 row-span-1 rounded-2xl md:rounded-3xl bg-gradient-to-b from-white to-zinc-50/90 border border-zinc-200/90 shadow-md p-2 flex items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300 p-0.5 sm:p-1 flex items-center justify-center shadow-lg shadow-pink-200/50 animate-pulse">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-900 to-indigo-950 flex items-center justify-center border border-white/40">
                <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/60">
                  <span className="text-white text-[9px] sm:text-[11px] font-black">««</span>
                </div>
              </div>
            </div>
          </div>
          {/* 12. ARMAND MAULANA (col 3 to 4) */}
          {renderArtistCard(artistMap.get('armand maulana') || { id: '10', name: 'ARMAND MAULANA', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* 13. RONY PARULIAN (col 5 to 6) */}
          {renderArtistCard(artistMap.get('rony parulian') || { id: '11', name: 'RONY PARULIAN', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* 14. Letto (col 7 to 8) */}
          {renderArtistCard(artistMap.get('letto') || { id: '12', name: 'Letto', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* 15. THE CHANGCUTERS (col 9 to 10) */}
          {renderArtistCard(artistMap.get('the changcuters') || { id: '13', name: 'THE CHANGCUTERS', cardSize: 'normal' }, 'col-span-2 row-span-1')}
          {/* 16. KANGEN BAND (col 11 to 12) */}
          {renderArtistCard(artistMap.get('kangen band') || { id: '14', name: 'KANGEN BAND', cardSize: 'normal' }, 'col-span-2 row-span-1')}

          {/* ROW 5 */}
          {/* 17. SPECIAL TILE: Soundwave Equalizer Graphic Card (col 1 to 6) */}
          <div className="col-span-6 row-span-1 rounded-2xl md:rounded-3xl bg-gradient-to-r from-zinc-100 via-white to-zinc-100 border border-zinc-200/90 shadow-md p-3 sm:p-5 flex items-center justify-center overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-1.5 h-8 sm:h-10 w-full justify-center opacity-70">
              {[40, 65, 30, 85, 50, 95, 40, 70, 30, 90, 60, 45, 80, 55, 90, 35, 75, 45, 85, 60, 30, 90, 50, 70, 40, 80].map((h, i) => (
                <div
                  key={i}
                  className="w-1 sm:w-1.5 bg-zinc-800 rounded-full transition-all duration-300"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          {/* 18. ANDRA AND THE BACKBONE (col 7 to 10) */}
          {renderArtistCard(artistMap.get('andra and the backbone') || { id: '15', name: 'ANDRA AND THE BACKBONE', cardSize: 'wide' }, 'col-span-4 row-span-1')}
          {/* 19. SPECIAL TILE: More to Come Text Card (col 11 to 12) */}
          <div className="col-span-2 row-span-1 rounded-2xl md:rounded-3xl bg-transparent p-2 flex flex-col justify-center items-center text-center">
            <span className="bg-gradient-to-r from-[#DB5494] to-[#3B82F6] bg-clip-text text-transparent font-bold text-base sm:text-2xl leading-none">
              More
            </span>
            <span className="text-zinc-800 font-medium text-xs sm:text-lg leading-tight">
              to Come
            </span>
          </div>

          {/* Additional custom artists added dynamically via CMS */}
          {currentArtists.filter(a => !['peterpan', 'burgerkill', 'kotak', 'geisha', 'perunggu', 'enau', 'charly setia band', 'gigi', 't-five', 'armand maulana', 'rony parulian', 'letto', 'the changcuters', 'kangen band', 'andra and the backbone'].includes(a.name.toLowerCase().trim())).map(a => (
            renderArtistCard(a, a.cardSize === 'extrawide' ? 'col-span-6' : a.cardSize === 'large' ? 'col-span-4 row-span-2' : a.cardSize === 'wide' ? 'col-span-4' : 'col-span-2')
          ))}

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

