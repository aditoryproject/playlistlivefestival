import { NextRequest, NextResponse } from 'next/server';
import { recordVisitorLog } from '@/lib/db';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

// Categorize HTTP Referrer & UTM params into friendly Traffic Source names
function categorizeTrafficSource(referrer: string, utmSource?: string): string {
  const ref = (referrer || '').toLowerCase();
  const utm = (utmSource || '').toLowerCase();

  if (utm.includes('instagram') || ref.includes('instagram.com') || ref.includes('l.instagram.com')) {
    return 'Instagram';
  }
  if (utm.includes('facebook') || ref.includes('facebook.com') || ref.includes('fb.me') || ref.includes('m.facebook.com')) {
    return 'Facebook';
  }
  if (utm.includes('tiktok') || ref.includes('tiktok.com') || ref.includes('vm.tiktok.com')) {
    return 'TikTok';
  }
  if (utm.includes('whatsapp') || ref.includes('whatsapp.com') || ref.includes('api.whatsapp.com') || ref.includes('wa.me')) {
    return 'WhatsApp';
  }
  if (utm.includes('twitter') || utm.includes('x.com') || ref.includes('twitter.com') || ref.includes('t.co') || ref.includes('x.com')) {
    return 'X (Twitter)';
  }
  if (utm.includes('google') || ref.includes('google.com') || ref.includes('google.co.id')) {
    return 'Google Search';
  }
  if (utm.includes('youtube') || ref.includes('youtube.com') || ref.includes('youtu.be')) {
    return 'YouTube';
  }
  if (ref && !ref.includes(process.env.NEXT_PUBLIC_DOMAIN || 'localhost')) {
    try {
      const url = new URL(ref);
      return url.hostname.replace('www.', '');
    } catch (e) {
      return 'External Link';
    }
  }
  return 'Direct / Bookmark';
}

// Detect Device Type from User-Agent
function detectDeviceType(userAgent: string): string {
  const ua = (userAgent || '').toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 10 tracking requests per 10 seconds per IP
    const rateLimit = checkRateLimit(`track_${clientIp}`, 10, 10 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json({ success: true, rateLimited: true });
    }

    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get('user-agent') || body.userAgent || '';
    const referrer = body.referrer || req.headers.get('referer') || '';

    // Detect Geolocation City (from Cloudflare headers or IP Lookup)
    let city = req.headers.get('cf-ipcity') || req.headers.get('x-vercel-ip-city') || '';
    let country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'Indonesia';

    // If city is unknown and in production/local, attempt IP geolocation lookup
    if (!city || city === 'Unknown') {
      if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
        try {
          const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=city,country`, {
            signal: AbortSignal.timeout(1500),
          });
          const geoData = await geoRes.json();
          if (geoData && geoData.city) {
            city = geoData.city;
            country = geoData.country || 'Indonesia';
          }
        } catch (err) {
          city = 'Bandung'; // Default fallback
        }
      } else {
        city = 'Bandung'; // Default local test city
      }
    }

    const sourceCategory = categorizeTrafficSource(referrer, body.utmSource);
    const deviceType = detectDeviceType(userAgent);

    await recordVisitorLog({
      ipAddress: clientIp,
      city: city || 'Bandung',
      country: country || 'Indonesia',
      referrer: referrer || 'Direct',
      sourceCategory,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
      deviceType,
      browser: userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Safari') ? 'Safari' : 'Browser',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
