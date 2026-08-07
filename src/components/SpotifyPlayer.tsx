'use client';

import React from 'react';
import { Disc3 } from 'lucide-react';

interface SpotifyPlayerProps {
  spotifyEmbedUrl: string;
}

export default function SpotifyPlayer({ spotifyEmbedUrl }: SpotifyPlayerProps) {
  if (!spotifyEmbedUrl) return null;

  return (
    <section className="py-12 px-4 bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Disc3 className="w-3.5 h-3.5 animate-spin" />
          <span>Official Festival Spotify Playlist</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
          Dengarkan Hits Konser
        </h2>

        <div className="rounded-2xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-800">
          <iframe
            src={spotifyEmbedUrl}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
