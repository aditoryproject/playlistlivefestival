import { NextRequest, NextResponse } from 'next/server';
import {
  recordCompensationApplication,
  getCompensationApplicationsFromDb,
  deleteCompensationApplicationFromDb,
  evaluateClaimCuration,
} from '@/lib/db';
import { getSiteConfigAsync } from '@/lib/config';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 5 submissions per 60 seconds per IP
    const rateLimit = checkRateLimit(`compensation_submit_${clientIp}`, 5, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      fullName,
      identityNumber,
      ktpImageUrl,
      whatsapp,
      email,
      ticketProofUrl,
      ticketCount,
    } = body;

    // Field Validations according to exact Google Form sample
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Nama Lengkap (Sesuai KTP) wajib diisi.' }, { status: 400 });
    }

    if (!identityNumber || !identityNumber.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor Identitas (KTP) wajib diisi.' }, { status: 400 });
    }

    if (!ktpImageUrl || !ktpImageUrl.trim()) {
      return NextResponse.json({ success: false, error: 'Foto/File Upload KTP wajib diunggah.' }, { status: 400 });
    }

    if (!whatsapp || !whatsapp.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor WhatsApp wajib diisi.' }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Alamat Email wajib diisi.' }, { status: 400 });
    }

    if (!ticketProofUrl || !ticketProofUrl.trim()) {
      return NextResponse.json(
        { success: false, error: 'Upload Bukti E-Tiket Pembelian Tiket 2024 wajib diunggah.' },
        { status: 400 }
      );
    }

    if (!ticketCount || !ticketCount.trim()) {
      return NextResponse.json(
        { success: false, error: 'Jumlah Tiket yang ingin dikompensasi wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Record compensation application to DB
    const application = await recordCompensationApplication({
      fullName: fullName.trim(),
      identityNumber: identityNumber.trim(),
      ktpImageUrl: ktpImageUrl.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      ticketProofUrl: ticketProofUrl.trim(),
      ticketCount: ticketCount.trim(),
    });

    // 2. Fetch site config for WA group URL & Google Sheets Webhook URL
    const config = await getSiteConfigAsync();
    const waGroupUrl = config.compensationWaGroupUrl || 'https://chat.whatsapp.com/';
    const webhookUrl = config.compensationGoogleSheetWebhook;

    // 3. Optional: Sync to Google Sheets Webhook in background
    if (webhookUrl && webhookUrl.startsWith('http')) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: application.createdAt,
          fullName: application.fullName,
          identityNumber: application.identityNumber,
          ktpImageUrl: application.ktpImageUrl,
          whatsapp: application.whatsapp,
          email: application.email,
          ticketProofUrl: application.ticketProofUrl,
          ticketCount: application.ticketCount,
        }),
      }).catch((err) => {
        console.error('[Compensation Webhook] Error posting to Google Sheets:', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: application,
      waGroupUrl,
    });
  } catch (error) {
    console.error('Error handling compensation submission:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rawData = await getCompensationApplicationsFromDb();
    const data = await Promise.all(
      rawData.map(async (item) => {
        const curation = await evaluateClaimCuration(item);
        return {
          ...item,
          curation,
        };
      })
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching compensation applications:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data kompensasi.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak valid.' }, { status: 400 });
    }

    const deleted = await deleteCompensationApplicationFromDb(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting compensation application:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data kompensasi.' }, { status: 500 });
  }
}
