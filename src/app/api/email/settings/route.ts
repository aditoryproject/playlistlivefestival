import { NextRequest, NextResponse } from 'next/server';
import { getSmtpSettingsFromDb, saveSmtpSettingsToDb, SmtpSettings } from '@/lib/db';
import { verifySmtpConnection } from '@/lib/emailSender';

export async function GET() {
  try {
    const settings = await getSmtpSettingsFromDb();
    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: {
          host: '',
          port: 465,
          secure: true,
          user: '',
          pass: '',
          fromEmail: '',
          fromName: 'Playlist Live Festival',
          replyTo: '',
        },
      });
    }

    // Mask password for security
    const maskedSettings = {
      ...settings,
      pass: settings.pass ? '••••••••' : '',
      hasPass: Boolean(settings.pass),
    };

    return NextResponse.json({ success: true, settings: maskedSettings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { host, port, secure, user, pass, fromEmail, fromName, replyTo, testConnection } = body;

    if (!host || !user || !fromEmail) {
      return NextResponse.json(
        { success: false, error: 'Host, Username/Email, dan Sender Email wajib diisi.' },
        { status: 400 }
      );
    }

    // Fetch existing if password is not changed
    let finalPass = pass;
    if (!finalPass || finalPass === '••••••••') {
      const existing = await getSmtpSettingsFromDb();
      finalPass = existing?.pass || '';
    }

    const settings: SmtpSettings = {
      host: host.trim(),
      port: Number(port) || 465,
      secure: Boolean(secure),
      user: user.trim(),
      pass: finalPass,
      fromEmail: fromEmail.trim(),
      fromName: (fromName || 'Playlist Live Festival').trim(),
      replyTo: (replyTo || '').trim(),
    };

    // If test connection requested
    if (testConnection) {
      const testResult = await verifySmtpConnection(settings);
      if (!testResult.success) {
        return NextResponse.json(
          { success: false, error: `Uji koneksi SMTP gagal: ${testResult.message}` },
          { status: 400 }
        );
      }
    }

    const saved = await saveSmtpSettingsToDb(settings);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Gagal menyimpan pengaturan SMTP.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: testConnection
        ? 'Koneksi SMTP berhasil diverifikasi dan disimpan!'
        : 'Pengaturan SMTP berhasil disimpan.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
