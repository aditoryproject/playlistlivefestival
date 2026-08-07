import { NextRequest, NextResponse } from 'next/server';
import { incrementBuyNowClickAsync } from '@/lib/config';
import { getDetailedVisitorAnalytics } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const data = await getDetailedVisitorAnalytics(startDate, endDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Rate Limiting: Max 30 click tracking events per minute per IP (Anti-Spam)
    const rateLimit = checkRateLimit(`analytics_${clientIp}`, 30, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const newCount = await incrementBuyNowClickAsync(userAgent, clientIp);

    return NextResponse.json({ success: true, count: newCount });
  } catch (error) {
    console.error('API POST /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 });
  }
}
