'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Maximize2, ExternalLink, X, ZoomIn, Layers } from 'lucide-react';

interface TenantLayoutViewerProps {
  imageSrc?: string;
  versionTitle?: string;
  compact?: boolean;
}

export default function TenantLayoutViewer({
  imageSrc = '/layout-tenant.png',
  versionTitle = 'LAYOUT TENANT PLAYLIST REWIND',
  compact = false,
}: TenantLayoutViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* PREVIEW CARD */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-amber-400/80 mb-6">
        {/* Card Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-transparent">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              <Layers className="w-3 h-3 text-amber-600" />
              <span>Denah Resmi Area Acara</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-zinc-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{versionTitle}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500">
              Pelajari tata letak panggung, alur crowd pengunjung, dan titik lokasi booth F&B.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Perbesar Denah</span>
            </button>
            <a
              href={imageSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors"
              title="Buka gambar resolusi asli di tab baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Buka Asli</span>
            </a>
          </div>
        </div>

        {/* Image Preview with Zoom Overlay */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative group cursor-zoom-in bg-zinc-950/5 flex items-center justify-center overflow-hidden"
          style={{ maxHeight: compact ? '260px' : '420px' }}
        >
          <img
            src={imageSrc}
            alt={versionTitle}
            className="w-full h-auto object-contain max-h-[420px] transition-transform duration-500 group-hover:scale-[1.01]"
            loading="lazy"
          />

          {/* Hover Hint Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs text-zinc-900 px-4 py-2 rounded-full font-bold text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <ZoomIn className="w-4 h-4 text-amber-600" />
              Klik untuk melihat denah resolusi penuh
            </span>
          </div>

          {/* Floating Mobile Tap Badge */}
          <div className="sm:hidden absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <ZoomIn className="w-3 h-3 text-amber-400" />
            <span>Ketuk untuk Zoom</span>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-6 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          {/* Top Bar Floating Controls */}
          <div
            className="absolute top-3 left-3 right-3 sm:top-5 sm:left-6 sm:right-6 flex items-center justify-between z-10 pointer-events-none"
          >
            <div className="bg-zinc-900/90 border border-zinc-700/60 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full pointer-events-auto flex items-center gap-2 shadow-lg">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="truncate max-w-[200px] sm:max-w-md">{versionTitle}</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <a
                href={imageSrc}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-xs font-bold px-3 py-2 rounded-full shadow-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buka Resolusi Asli</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 hover:text-white flex items-center justify-center transition-colors shadow-lg"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Full Image Container */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-2 pt-14"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageSrc}
              alt={versionTitle}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
