'use client';

import React from 'react';

interface FooterProps {
  eventTitle: string;
}

export default function Footer({ eventTitle }: FooterProps) {
  return (
    <footer className="py-8 px-4 border-t border-zinc-100 bg-white text-zinc-500 text-xs sm:text-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-center">
        <p>© {new Date().getFullYear()} {eventTitle}. All rights reserved.</p>
      </div>
    </footer>
  );
}
