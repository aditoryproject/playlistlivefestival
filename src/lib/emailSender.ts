import nodemailer from 'nodemailer';
import { SmtpSettings } from './db';
import { renderEmailHtml, renderEmailPlainText } from './emailTemplate';

/**
 * Create a safe nodemailer transporter from SMTP settings
 */
export function createSmtpTransporter(settings: SmtpSettings) {
  const isPort465 = Number(settings.port) === 465 || Boolean(settings.secure);

  return nodemailer.createTransport({
    host: settings.host,
    port: Number(settings.port) || 465,
    secure: isPort465, // true for 465 SSL, false for 587 STARTTLS
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
    // Safe TLS options - compatible with cPanel / Dewaweb / VPS
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
}

/**
 * Verify if SMTP connection credentials are correct
 */
export async function verifySmtpConnection(settings: SmtpSettings): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createSmtpTransporter(settings);
    await transporter.verify();
    return { success: true, message: 'Koneksi SMTP Berhasil terhubung!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal terhubung ke SMTP server' };
  }
}

/**
 * Send a single email with safe deliverability headers
 */
export async function sendQueuedEmail(params: {
  settings: SmtpSettings;
  toEmail: string;
  toName: string;
  subject: string;
  templateHtml: string;
  domainUrl: string;
  isTest?: boolean;
}): Promise<{ success: boolean; messageId?: string; response?: string; error?: string }> {
  const { settings, toEmail, toName, subject, templateHtml, domainUrl, isTest } = params;

  try {
    const transporter = createSmtpTransporter(settings);

    // Generate unsubscribe link
    const unsubscribeUrl = `${domainUrl}/api/email/unsubscribe?email=${encodeURIComponent(toEmail)}`;

    // Render HTML & Plain Text
    const html = renderEmailHtml(templateHtml, toName, unsubscribeUrl);
    const text = renderEmailPlainText(toName, unsubscribeUrl);

    // Clean sender format: "Playlist Live Festival" <info@domain.com>
    const from = settings.fromName
      ? `"${settings.fromName.replace(/"/g, '')}" <${settings.fromEmail}>`
      : settings.fromEmail;

    // Headers - Clean without custom X-Mailer or invalid Unsubscribe-Post which trigger spam filters
    const headers: Record<string, string> = {
      'Reply-To': settings.replyTo || settings.fromEmail,
    };

    if (!isTest) {
      headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
    }

    // Send email with explicit SMTP envelope to prevent cPanel envelope mismatch
    const info = await transporter.sendMail({
      envelope: {
        from: settings.fromEmail,
        to: toEmail,
      },
      from,
      to: toName ? `"${toName.replace(/"/g, '')}" <${toEmail}>` : toEmail,
      replyTo: settings.replyTo || settings.fromEmail,
      subject,
      text,
      html,
      headers,
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (err: any) {
    console.error(`[Email Sender] Error sending to ${toEmail}:`, err);
    return { success: false, error: err.message || 'Gagal mengirim email' };
  }
}

/**
 * Send a clean system test email (exactly like TaskManager style)
 * Guaranteed to pass spam filters as a system transactional test
 */
export async function sendSystemTestEmail(params: {
  settings: SmtpSettings;
  toEmail: string;
}): Promise<{ success: boolean; messageId?: string; response?: string; error?: string }> {
  const { settings, toEmail } = params;

  try {
    const transporter = createSmtpTransporter(settings);
    const from = settings.fromName
      ? `"${settings.fromName.replace(/"/g, '')}" <${settings.fromEmail}>`
      : settings.fromEmail;

    const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tes Konfigurasi Email SMTP</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 30px 15px; color: #1f2937;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h2 style="color: #2563eb; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">
      Koneksi SMTP Berhasil!
    </h2>
    <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 16px 0;">
      Pengaturan email <strong>Playlist Live Festival</strong> Anda telah terhubung dan siap mengirimkan notifikasi serta email blast secara otomatis.
    </p>
    <div style="background-color: #f3f4f6; border-radius: 10px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #4b5563;">
      <div><strong>SMTP Server:</strong> ${settings.host}:${settings.port}</div>
      <div style="margin-top: 4px;"><strong>Pengirim:</strong> ${from}</div>
      <div style="margin-top: 4px;"><strong>Waktu Tes:</strong> ${nowStr} WIB</div>
    </div>
    <p style="font-size: 12px; color: #9ca3af; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; pt: 16px;">
      Email uji coba otomatis dari sistem Playlist Rewind CMS.
    </p>
  </div>
</body>
</html>`;

    const text = `Koneksi SMTP Berhasil!\n\nPengaturan email Playlist Live Festival Anda telah terhubung dan siap mengirimkan notifikasi serta email blast secara otomatis.\n\nSMTP Server: ${settings.host}:${settings.port}\nPengirim: ${from}\nWaktu Tes: ${nowStr} WIB`;

    const info = await transporter.sendMail({
      envelope: {
        from: settings.fromEmail,
        to: toEmail,
      },
      from,
      to: toEmail,
      replyTo: settings.replyTo || settings.fromEmail,
      subject: 'Tes Konfigurasi Email SMTP - Playlist Live Festival',
      text,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (err: any) {
    console.error(`[System Test Email] Error:`, err);
    return { success: false, error: err.message || 'Gagal mengirim email uji coba' };
  }
}
