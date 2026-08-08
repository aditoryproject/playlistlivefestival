// Declarations for global tracking objects
declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
    gtag?: any;
    dataLayer?: any[];
    triggerBuyNowPixels?: (eventTitle?: string) => void;
  }
}

export function triggerBuyNowPixels(eventTitle: string = 'Playlist Rewind 2026 Ticket') {
  if (typeof window === 'undefined') return;

  console.log('[Pixel Tracking] Firing Buy Now events across all pixel platforms...');

  // 1. Meta (Facebook) Pixel Events (InitiateCheckout, AddToCart, Lead, ClickBuyNow)
  const fbq = window.fbq || (window as any)._fbq;
  if (fbq && typeof fbq === 'function') {
    try {
      fbq('track', 'InitiateCheckout', {
        content_name: eventTitle,
        currency: 'IDR',
        value: 1,
      });
      fbq('track', 'AddToCart', {
        content_name: eventTitle,
        currency: 'IDR',
        value: 1,
      });
      fbq('track', 'Lead', {
        content_name: eventTitle,
      });
      fbq('trackCustom', 'ClickBuyNow', {
        content_name: eventTitle,
      });
      console.log('✅ Meta Pixel InitiateCheckout, AddToCart & Lead fired');
    } catch (e) {
      console.error('Error firing Meta Pixel:', e);
    }
  } else {
    console.warn('⚠️ Meta Pixel (window.fbq) is not loaded yet');
  }

  // 2. TikTok Pixel Events
  const ttq = window.ttq;
  if (ttq && typeof ttq.track === 'function') {
    try {
      ttq.track('InitiateCheckout', {
        content_name: eventTitle,
      });
      ttq.track('ClickButton', {
        button_name: 'Buy Now',
      });
      console.log('✅ TikTok Pixel InitiateCheckout fired');
    } catch (e) {
      console.error('Error firing TikTok Pixel:', e);
    }
  }

  // 3. Google Tag (GA4 / GTM) Events
  const gtag = window.gtag;
  if (gtag && typeof gtag === 'function') {
    try {
      gtag('event', 'begin_checkout', {
        event_category: 'Ecommerce',
        event_label: eventTitle,
        value: 1,
      });
      gtag('event', 'buy_now_click', {
        event_category: 'Conversion',
        event_label: eventTitle,
      });
      console.log('✅ Google Tag begin_checkout fired');
    } catch (e) {
      console.error('Error firing Google Tag:', e);
    }
  }

  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: 'buy_now_click',
        ticket_event_name: eventTitle,
        timestamp: new Date().toISOString(),
      });
      console.log('✅ Google DataLayer event pushed');
    } catch (e) {
      console.error('Error pushing dataLayer event:', e);
    }
  }
}

// Bind to window object for global availability
if (typeof window !== 'undefined') {
  window.triggerBuyNowPixels = triggerBuyNowPixels;
}
