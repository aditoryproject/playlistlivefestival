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
  console.log('[Pixel Tracking] Firing Buy Now event across all pixel platforms...');

  // 1. Meta (Facebook) Pixel Event
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_name: eventTitle,
        currency: 'IDR',
      });
      window.fbq('trackCustom', 'ClickBuyNow', {
        content_name: eventTitle,
      });
      console.log('✅ Meta Pixel InitiateCheckout fired');
    } catch (e) {
      console.error('Error firing Meta Pixel:', e);
    }
  }

  // 2. TikTok Pixel Event
  if (typeof window !== 'undefined' && window.ttq) {
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

  // 3. Google Tag (GA4 / GTM) Event
  if (typeof window !== 'undefined') {
    if (window.gtag) {
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
        console.log('✅ Google Tag (gtag) begin_checkout fired');
      } catch (e) {
        console.error('Error firing Google Tag:', e);
      }
    }

    if (window.dataLayer) {
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
}
