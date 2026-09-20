import { NextRequest, NextResponse } from 'next/server';
import { getSmtpSettingsFromDb } from '@/lib/db';
import { sendQueuedEmail, sendSystemTestEmail } from '@/lib/emailSender';
import { DEFAULT_EMAIL_HTML_TEMPLATE, DEFAULT_EMAIL_SUBJECT } from '@/lib/emailTemplate';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testEmail, testName, subject, templateHtml, type } = body;

    if (!testEmail || !testEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Masukkan alamat email tujuan uji coba yang valid.' },
        { status: 400 }
      );
    }

    const smtpSettings = await getSmtpSettingsFromDb();
    if (!smtpSettings || !smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
      return NextResponse.json(
        { success: false, error: 'Pengaturan SMTP belum disimpan atau belum lengkap di tab Pengaturan SMTP.' },
        { status: 400 }
      );
    }

    // If test type is 'system' (like TaskManager test email)
    if (type === 'system') {
      const sendResult = await sendSystemTestEmail({
        settings: smtpSettings,
        toEmail: testEmail.trim(),
      });

      if (sendResult.success) {
        return NextResponse.json({
          success: true,
          message: `Email uji coba berhasil dikirim ke ${testEmail}! (Respons server: ${sendResult.response || '250 OK'})`,
          response: sendResult.response,
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Gagal mengirim: ${sendResult.error}` },
          { status: 400 }
        );
      }
    }

    // Default: campaign email preview test
    const host = req.headers.get('host') || 'playlistlivefestival.letsplaymaker.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const domainUrl = `${protocol}://${host}`;

    // Ensure official festival template or updated Goers CTA link
    let finalHtml = templateHtml;
    if (
      type === 'official_festival' ||
      !finalHtml ||
      !finalHtml.includes('Perunggu') ||
      finalHtml.includes('https://playlistlivefestival.letsplaymaker.com/" target="_blank"')
    ) {
      finalHtml = DEFAULT_EMAIL_HTML_TEMPLATE;
    } else {
      finalHtml = finalHtml
        .replace(/https:\/\/playlistlivefestival\.letsplaymaker\.com\/(?=["']\s*target)/g, 'https://goers.co/playlistlivefestival2026')
        .replace(/https:\/\/loket\.com(?=["'])/g, 'https://goers.co/playlistlivefestival2026');
    }

    const sendResult = await sendQueuedEmail({
      settings: smtpSettings,
      toEmail: testEmail.trim(),
      toName: testName || 'Tester Playlist',
      subject: (subject || DEFAULT_EMAIL_SUBJECT).trim(),
      templateHtml: finalHtml,
      domainUrl,
      isTest: true,
    });

    if (sendResult.success) {
      return NextResponse.json({
        success: true,
        message: `Email uji coba berhasil dikirim ke ${testEmail}! (Respons server: ${sendResult.response || '250 OK'})`,
        response: sendResult.response,
      });
    } else {
      return NextResponse.json(
        { success: false, error: `Gagal mengirim email: ${sendResult.error}` },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
