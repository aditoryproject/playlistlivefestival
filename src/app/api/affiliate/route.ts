import { NextRequest, NextResponse } from 'next/server';
import {
  recordAffiliateApplication,
  getAffiliateApplicationsFromDb,
  deleteAffiliateApplicationFromDb,
} from '@/lib/db';
import { getSiteConfigAsync } from '@/lib/config';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 5 submissions per 60 seconds per IP
    const rateLimit = checkRateLimit(`affiliate_submit_${clientIp}`, 5, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { fullName, whatsapp, email, instagramTiktok, city, experience } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Nama Lengkap wajib diisi.' }, { status: 400 });
    }

    if (!whatsapp || !whatsapp.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor WhatsApp wajib diisi.' }, { status: 400 });
    }

    // 1. Record application to DB
    const application = await recordAffiliateApplication({
      fullName: fullName.trim(),
      whatsapp: whatsapp.trim(),
      email: email ? email.trim() : '',
      instagramTiktok: instagramTiktok ? instagramTiktok.trim() : '',
      city: city ? city.trim() : '',
      experience: experience ? experience.trim() : '',
    });

    // 2. Fetch site config for WA group URL & Google Sheets Webhook URL
    const config = await getSiteConfigAsync();
    const waGroupUrl = config.affiliateWaGroupUrl || 'https://chat.whatsapp.com/';
    const webhookUrl = config.affiliateGoogleSheetWebhook;

    // 3. Optional: Sync to Google Sheets Webhook in background
    if (webhookUrl && webhookUrl.startsWith('http')) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: application.createdAt,
          fullName: application.fullName,
          whatsapp: application.whatsapp,
          email: application.email,
          instagramTiktok: application.instagramTiktok,
          city: application.city,
          experience: application.experience,
        }),
      }).catch((err) => {
        console.error('[Affiliate Webhook] Error posting to Google Sheets:', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: application,
      waGroupUrl,
    });
  } catch (error) {
    console.error('Error handling affiliate submission:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await getAffiliateApplicationsFromDb();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching affiliate applications:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data affiliate.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak valid.' }, { status: 400 });
    }

    const deleted = await deleteAffiliateApplicationFromDb(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting affiliate application:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data.' }, { status: 500 });
  }
}
