'use client';

import React, { useState } from 'react';
import { triggerBuyNowPixels } from '@/lib/pixels';

interface BuyNowButtonProps {
  ticketUrl: string;
  buttonText?: string;
  eventTitle?: string;
  enableSound?: boolean;
}

export default function BuyNowButton({
  ticketUrl,
  buttonText = 'Buy Now!',
  eventTitle = 'Playlist Rewind 2026',
  enableSound = true,
}: BuyNowButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsClicked(true);

    // 1. Immediately fire Pixel events (Meta InitiateCheckout, TikTok, Google Analytics)
    triggerBuyNowPixels(eventTitle);

    // 2. Increment click counter in backend analytics silently
    try {
      fetch('/api/analytics', { method: 'POST' }).catch(() => {});
    } catch (err) {}

    // 3. Audio click feedback if enabled
    if (enableSound && typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (err) {}
    }

    setTimeout(() => {
      setIsClicked(false);
    }, 400);
  };

  return (
    <div className="inline-block relative">
      {/* Outer ambient glow pulse for attention */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-400/30 via-purple-400/30 to-blue-400/30 blur-md opacity-70 animate-pulse group-hover:opacity-100 transition-opacity" />

      {/* Button Body - Soft Apple pill button with subtle float bounce */}
      <a
        href={ticketUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative inline-flex items-center justify-center px-10 min-[380px]:px-14 sm:px-16 py-3.5 sm:py-4 bg-[#F5F5F7] hover:bg-white text-zinc-950 font-normal text-base min-[380px]:text-lg sm:text-2xl rounded-full shadow-[0_6px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(219,84,148,0.25)] border border-zinc-200/90 transition-all duration-300 ${
          isClicked ? 'scale-95 opacity-90' : 'hover:-translate-y-1 hover:scale-105'
        }`}
      >
        <span>{buttonText}</span>
      </a>
    </div>
  );
}
