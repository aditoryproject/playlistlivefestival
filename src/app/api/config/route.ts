import { NextResponse } from 'next/server';
import { getSiteConfigAsync, saveSiteConfigAsync } from '@/lib/config';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET() {
  try {
    const config = await getSiteConfigAsync();
    // Auto-persist sanitized config back to DB/file to purge legacy contaminated rows
    await saveSiteConfigAsync(config).catch(() => {});
    return NextResponse.json(config);
  } catch (error) {
    console.error('API GET /api/config error:', error);
    return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Rate Limiting: Max 30 updates per 10 minutes per IP
    const rateLimit = checkRateLimit(`config_post_${clientIp}`, 30, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan pembaruan. Silakan coba lagi nanti.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const updated = await saveSiteConfigAsync(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error('API POST /api/config error:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}
