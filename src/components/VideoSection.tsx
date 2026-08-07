'use client';

import React, { useState } from 'react';
import { Play, Video, X } from 'lucide-react';

interface VideoSectionProps {
  title: string;
  subtitle: string;
  embedUrl: string;
  coverImage: string;
}

export default function VideoSection({
  title,
  subtitle,
  embedUrl,
  coverImage,
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 px-4 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 text-pink-400 border border-pink-800/50 text-xs font-semibold uppercase tracking-wider mb-3">
            <Video className="w-3.5 h-3.5" />
            <span>Festival Teaser & Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {title}
          </h2>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Video Player Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900 group aspect-video">
          {!isPlaying ? (
            <div className="relative w-full h-full">
              {/* Cover Thumbnail Image */}
              <img
                src={coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

              {/* Center Play Button with Halo Glow */}
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-zinc-950 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group/btn"
                aria-label="Play Festival Video Teaser"
              >
                <div className="absolute -inset-2 rounded-full bg-pink-500/40 animate-ping pointer-events-none" />
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5 text-zinc-950 group-hover/btn:text-pink-600 transition-colors" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-zinc-300">
                <span className="font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  ▶ Click for Teaser Video
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full bg-black">
              {/* Close Button */}
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
                title="Tutup Video"
              >
                <X className="w-5 h-5" />
              </button>

              <iframe
                src={embedUrl.includes('?') ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`}
                title={title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
