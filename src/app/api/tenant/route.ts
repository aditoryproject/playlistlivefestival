import { NextRequest, NextResponse } from 'next/server';
import {
  recordTenantApplication,
  getTenantApplicationsFromDb,
  deleteTenantApplicationFromDb,
} from '@/lib/db';
import { getSiteConfigAsync } from '@/lib/config';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 5 submissions per 60 seconds per IP
    const rateLimit = checkRateLimit(`tenant_submit_${clientIp}`, 5, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      brandName,
      category,
      menuDescription,
      priceRange,
      instagramCatalog,
      picName,
      whatsapp,
      email,
      city,
      powerRequirement,
      equipmentList,
      eventExperience,
    } = body;

    if (!brandName || !brandName.trim()) {
      return NextResponse.json({ success: false, error: 'Nama Brand / Usaha wajib diisi.' }, { status: 400 });
    }

    if (!category || !category.trim()) {
      return NextResponse.json({ success: false, error: 'Kategori Produk F&B wajib dipilih.' }, { status: 400 });
    }

    if (!picName || !picName.trim()) {
      return NextResponse.json({ success: false, error: 'Nama Lengkap PIC / Owner wajib diisi.' }, { status: 400 });
    }

    if (!whatsapp || !whatsapp.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor WhatsApp wajib diisi.' }, { status: 400 });
    }

    // 1. Record application to DB
    const application = await recordTenantApplication({
      brandName: brandName.trim(),
      category: category.trim(),
      menuDescription: menuDescription ? menuDescription.trim() : '',
      priceRange: priceRange ? priceRange.trim() : '',
      instagramCatalog: instagramCatalog ? instagramCatalog.trim() : '',
      picName: picName.trim(),
      whatsapp: whatsapp.trim(),
      email: email ? email.trim() : '',
      city: city ? city.trim() : '',
      powerRequirement: powerRequirement ? powerRequirement.trim() : '',
      equipmentList: equipmentList ? equipmentList.trim() : '',
      eventExperience: eventExperience ? eventExperience.trim() : '',
    });

    // 2. Fetch site config for WA group URL & Google Sheets Webhook URL
    const config = await getSiteConfigAsync();
    const waGroupUrl = config.tenantWaGroupUrl || 'https://chat.whatsapp.com/';
    const webhookUrl = config.tenantGoogleSheetWebhook;

    // 3. Optional: Sync to Google Sheets Webhook in background
    if (webhookUrl && webhookUrl.startsWith('http')) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: application.createdAt,
          brandName: application.brandName,
          category: application.category,
          menuDescription: application.menuDescription,
          priceRange: application.priceRange,
          instagramCatalog: application.instagramCatalog,
          picName: application.picName,
          whatsapp: application.whatsapp,
          email: application.email,
          city: application.city,
          powerRequirement: application.powerRequirement,
          equipmentList: application.equipmentList,
          eventExperience: application.eventExperience,
        }),
      }).catch((err) => {
        console.error('[Tenant Webhook] Error posting to Google Sheets:', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: application,
      waGroupUrl,
    });
  } catch (error) {
    console.error('Error handling tenant submission:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await getTenantApplicationsFromDb();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching tenant applications:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data pendaftaran tenant.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak valid.' }, { status: 400 });
    }

    const deleted = await deleteTenantApplicationFromDb(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting tenant application:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data tenant.' }, { status: 500 });
  }
}
