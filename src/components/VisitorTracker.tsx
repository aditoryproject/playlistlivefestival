'use client';

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    // Only track once per page session
    if (typeof window === 'undefined') return;
    const sessionTracked = sessionStorage.getItem('playlist_tracked');
    if (sessionTracked) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source') || undefined;
      const utmMedium = urlParams.get('utm_medium') || undefined;
      const utmCampaign = urlParams.get('utm_campaign') || undefined;

      fetch('/api/track-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrer: document.referrer || '',
          utmSource,
          utmMedium,
          utmCampaign,
          userAgent: navigator.userAgent,
        }),
      })
        .then(() => {
          sessionStorage.setItem('playlist_tracked', 'true');
        })
        .catch(() => {});
    } catch (e) {}
  }, []);

  return null;
}
