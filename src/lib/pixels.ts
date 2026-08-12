// Declarations for global tracking objects
declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
    gtag?: any;
    dataLayer?: any[];
    triggerBuyNowPixels?: (eventTitle?: string) => void;
    triggerAffiliateClickPixels?: (eventTitle?: string) => void;
    triggerAffiliateSubmitPixels?: (eventTitle?: string) => void;
    triggerJoinWaGroupPixels?: (eventTitle?: string) => void;
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

/**
 * Pixel tracking when user clicks "Daftar Affiliate Playlist" (Intent)
 */
export function triggerAffiliateClickPixels(eventTitle: string = 'Affiliate Registration') {
  if (typeof window === 'undefined') return;

  console.log('[Pixel Tracking] Firing Affiliate Click events...');

  // Meta Pixel
  const fbq = window.fbq || (window as any)._fbq;
  if (fbq && typeof fbq === 'function') {
    try {
      fbq('trackCustom', 'ClickAffiliate', { content_name: eventTitle });
      fbq('track', 'FindLocation', { content_name: eventTitle });
      console.log('✅ Meta Pixel ClickAffiliate fired');
    } catch (e) {
      console.error('Error firing Meta Pixel:', e);
    }
  }

  // TikTok Pixel
  const ttq = window.ttq;
  if (ttq && typeof ttq.track === 'function') {
    try {
      ttq.track('ClickButton', { button_name: 'Affiliate Registration' });
      console.log('✅ TikTok Pixel ClickButton fired');
    } catch (e) {
      console.error('Error firing TikTok Pixel:', e);
    }
  }

  // Google Analytics / GTM
  const gtag = window.gtag;
  if (gtag && typeof gtag === 'function') {
    try {
      gtag('event', 'affiliate_click', {
        event_category: 'Affiliate',
        event_label: eventTitle,
      });
    } catch (e) {}
  }

  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: 'affiliate_click',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {}
  }
}

/**
 * Pixel tracking when user completes Affiliate Registration (Lead Conversion)
 */
export function triggerAffiliateSubmitPixels(eventTitle: string = 'Affiliate Partner Registration') {
  if (typeof window === 'undefined') return;

  console.log('[Pixel Tracking] Firing Affiliate Submit Lead events...');

  // Meta Pixel
  const fbq = window.fbq || (window as any)._fbq;
  if (fbq && typeof fbq === 'function') {
    try {
      fbq('track', 'Lead', {
        content_name: eventTitle,
        value: 1,
        currency: 'IDR',
      });
      fbq('track', 'CompleteRegistration', {
        content_name: eventTitle,
      });
      fbq('trackCustom', 'AffiliateSubmitted', {
        content_name: eventTitle,
      });
      console.log('✅ Meta Pixel Lead & CompleteRegistration fired');
    } catch (e) {
      console.error('Error firing Meta Pixel:', e);
    }
  }

  // TikTok Pixel
  const ttq = window.ttq;
  if (ttq && typeof ttq.track === 'function') {
    try {
      ttq.track('CompleteRegistration', { content_name: eventTitle });
      ttq.track('SubmitForm', { button_name: 'Affiliate Submit' });
      console.log('✅ TikTok Pixel CompleteRegistration fired');
    } catch (e) {
      console.error('Error firing TikTok Pixel:', e);
    }
  }

  // Google Tag / GTM
  const gtag = window.gtag;
  if (gtag && typeof gtag === 'function') {
    try {
      gtag('event', 'generate_lead', {
        event_category: 'Affiliate',
        event_label: eventTitle,
        value: 1,
      });
      gtag('event', 'affiliate_submitted', {
        event_category: 'Conversion',
        event_label: eventTitle,
      });
      console.log('✅ Google Tag generate_lead fired');
    } catch (e) {
      console.error('Error firing Google Tag:', e);
    }
  }

  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: 'affiliate_submitted',
        event_category: 'Lead',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {}
  }
}

/**
 * Pixel tracking when user clicks "Gabung WA Group Affiliate"
 */
export function triggerJoinWaGroupPixels(eventTitle: string = 'Affiliate WA Group') {
  if (typeof window === 'undefined') return;

  console.log('[Pixel Tracking] Firing Join WA Group events...');

  const fbq = window.fbq || (window as any)._fbq;
  if (fbq && typeof fbq === 'function') {
    try {
      fbq('track', 'Contact', { content_name: eventTitle });
      fbq('trackCustom', 'JoinAffiliateWaGroup', { content_name: eventTitle });
    } catch (e) {}
  }

  const ttq = window.ttq;
  if (ttq && typeof ttq.track === 'function') {
    try {
      ttq.track('Contact', { button_name: 'Join WA Group' });
    } catch (e) {}
  }

  const gtag = window.gtag;
  if (gtag && typeof gtag === 'function') {
    try {
      gtag('event', 'join_wa_group', {
        event_category: 'Affiliate',
        event_label: eventTitle,
      });
    } catch (e) {}
  }

  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: 'join_wa_group',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {}
  }
}

// Bind to window object for global availability
if (typeof window !== 'undefined') {
  window.triggerBuyNowPixels = triggerBuyNowPixels;
  window.triggerAffiliateClickPixels = triggerAffiliateClickPixels;
  window.triggerAffiliateSubmitPixels = triggerAffiliateSubmitPixels;
  window.triggerJoinWaGroupPixels = triggerJoinWaGroupPixels;
}
