import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Admin passcode can be configured via environment variable ADMIN_PASSCODE or defaults to 'PlaymakerSecret2026!'
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'PlaymakerSecret2026!';

/**
 * Constant-time string comparison to prevent timing attack vulnerabilities
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');

    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // SECURITY: Rate limiting - Max 5 login attempts per 5 minutes per IP (Anti Brute-Force)
    const rateLimit = checkRateLimit(`auth_attempt_${clientIp}`, 5, 5 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan login yang gagal. Silakan tunggu ${Math.ceil(
            rateLimit.resetMs / 1000
          )} detik sebelum mencoba lagi.`,
        },
        { status: 429 }
      );
    }

    const { passcode } = await request.json();

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json({ success: false, error: 'Password wajib diisi!' }, { status: 400 });
    }

    // Verify passcode securely
    if (safeCompare(passcode, ADMIN_PASSCODE)) {
      // Create session token signature
      const sessionToken = crypto
        .createHmac('sha256', ADMIN_PASSCODE)
        .update(`admin_session_${Date.now()}_${clientIp}`)
        .digest('hex');

      return NextResponse.json({
        success: true,
        token: sessionToken,
      });
    }

    return NextResponse.json({ success: false, error: 'Password CMS Salah!' }, { status: 401 });
  } catch (error) {
    console.error('API /api/auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
