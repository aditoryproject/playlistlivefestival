// Declarations for global tracking objects
declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
    gtag?: any;
    dataLayer?: any[];
  }
}

export function triggerBuyNowPixels(eventTitle: string = 'Playlist Rewind 2026 Ticket') {
  if (typeof window === 'undefined') return;

  console.log('[Pixel Tracking] Firing Buy Now events across all pixel platforms...');

  // 1. Meta (Facebook) Pixel Events (InitiateCheckout, AddToCart, Custom ClickBuyNow)
  if (window.fbq && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_name: eventTitle,
        currency: 'IDR',
        value: 1,
      });
      window.fbq('track', 'AddToCart', {
        content_name: eventTitle,
        currency: 'IDR',
        value: 1,
      });
      window.fbq('trackCustom', 'ClickBuyNow', {
        content_name: eventTitle,
      });
      console.log('✅ Meta Pixel InitiateCheckout & AddToCart fired');
    } catch (e) {
      console.error('Error firing Meta Pixel:', e);
    }
  }

  // 2. TikTok Pixel Events
  if (window.ttq && typeof window.ttq.track === 'function') {
    try {
      window.ttq.track('InitiateCheckout', {
        content_name: eventTitle,
      });
      window.ttq.track('ClickButton', {
        button_name: 'Buy Now',
      });
      console.log('✅ TikTok Pixel InitiateCheckout fired');
    } catch (e) {
      console.error('Error firing TikTok Pixel:', e);
    }
  }

  // 3. Google Tag (GA4 / GTM) Events
  if (window.gtag && typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'begin_checkout', {
        event_category: 'Ecommerce',
        event_label: eventTitle,
        value: 1,
      });
      window.gtag('event', 'buy_now_click', {
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
