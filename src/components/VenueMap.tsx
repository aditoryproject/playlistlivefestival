'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface VenueMapProps {
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
}

export default function VenueMap({ venueName, venueAddress, venueMapUrl }: VenueMapProps) {
  return (
    <section className="py-16 px-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200/60 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Venue & Location</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            {venueName}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-lg mx-auto text-sm sm:text-base">
            {venueAddress}
          </p>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium transition-colors shadow-sm"
          >
            <Navigation className="w-4 h-4" />
            <span>Petunjuk Arah Google Maps</span>
          </a>
        </div>

        {/* Embedded Google Map */}
        <div className="relative w-full h-[350px] sm:h-[420px] rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
          <iframe
            title={venueName}
            src={venueMapUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
