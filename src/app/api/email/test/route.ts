import { NextRequest, NextResponse } from 'next/server';
import { getSmtpSettingsFromDb } from '@/lib/db';
import { sendQueuedEmail } from '@/lib/emailSender';
import { DEFAULT_EMAIL_HTML_TEMPLATE, DEFAULT_EMAIL_SUBJECT } from '@/lib/emailTemplate';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testEmail, testName, subject, templateHtml } = body;

    if (!testEmail || !testEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Masukkan alamat email tujuan uji coba yang valid.' },
        { status: 400 }
      );
    }

    const smtpSettings = await getSmtpSettingsFromDb();
    if (!smtpSettings || !smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
      return NextResponse.json(
        { success: false, error: 'Pengaturan SMTP belum disimpan atau belum lengkap.' },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'playlistlivefestival.letsplaymaker.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const domainUrl = `${protocol}://${host}`;

    const sendResult = await sendQueuedEmail({
      settings: smtpSettings,
      toEmail: testEmail.trim(),
      toName: testName || 'Tester Playlist',
      subject: (subject || DEFAULT_EMAIL_SUBJECT).trim(),
      templateHtml: templateHtml || DEFAULT_EMAIL_HTML_TEMPLATE,
      domainUrl,
    });

    if (sendResult.success) {
      return NextResponse.json({
        success: true,
        message: `Email uji coba berhasil dikirim ke ${testEmail}! Cek inbox atau folder spam Anda.`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: `Gagal mengirim email uji coba: ${sendResult.error}` },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
