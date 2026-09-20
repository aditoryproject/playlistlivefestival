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
    secure: isPort465, // true for 465, false for 587 or others
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
    // Safe TLS options
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert issues on hosting
    },
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 20000,     // 20 seconds
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
 * Send a single email with safe deliverability headers (RFC-compliant)
 */
export async function sendQueuedEmail(params: {
  settings: SmtpSettings;
  toEmail: string;
  toName: string;
  subject: string;
  templateHtml: string;
  domainUrl: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { settings, toEmail, toName, subject, templateHtml, domainUrl } = params;

  try {
    const transporter = createSmtpTransporter(settings);

    // Generate unsubscribe link
    const unsubscribeUrl = `${domainUrl}/api/email/unsubscribe?email=${encodeURIComponent(toEmail)}`;

    // Render HTML & Plain Text
    const html = renderEmailHtml(templateHtml, toName, unsubscribeUrl);
    const text = renderEmailPlainText(toName, unsubscribeUrl);

    // Formatted sender
    const from = settings.fromName
      ? `"${settings.fromName}" <${settings.fromEmail}>`
      : settings.fromEmail;

    // Send email with RFC 8058 List-Unsubscribe header
    const info = await transporter.sendMail({
      from,
      to: toName ? `"${toName}" <${toEmail}>` : toEmail,
      replyTo: settings.replyTo || settings.fromEmail,
      subject,
      text,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Mailer': 'PlaylistRewind-Mailer/1.0',
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Sender] Error sending to ${toEmail}:`, err);
    return { success: false, error: err.message || 'Gagal mengirim email' };
  }
}
