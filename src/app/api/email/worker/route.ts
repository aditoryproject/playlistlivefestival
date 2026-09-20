import { NextRequest, NextResponse } from 'next/server';
import {
  getSmtpSettingsFromDb,
  getNextPendingEmailForWorker,
  markEmailQueueSent,
  markEmailQueueFailed,
} from '@/lib/db';
import { sendQueuedEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleWorkerRun(req);
}

export async function POST(req: NextRequest) {
  return handleWorkerRun(req);
}

async function handleWorkerRun(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const manualOverride = searchParams.get('manual') === 'true';

    // 1. Get SMTP settings
    const smtpSettings = await getSmtpSettingsFromDb();
    if (!smtpSettings || !smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
      return NextResponse.json({
        success: false,
        error: 'Pengaturan SMTP belum dikonfigurasi. Silakan lengkapi di tab Pengaturan SMTP.',
      });
    }

    // 2. Pick next pending email from active campaign
    const { queueItem, campaign, reason } = await getNextPendingEmailForWorker();

    if (!queueItem || !campaign) {
      return NextResponse.json({
        success: true,
        dispatched: false,
        message: reason || 'Tidak ada email antrean yang memenuhi syarat untuk dikirim saat ini.',
      });
    }

    // Determine domain URL for unsubscribe link
    const host = req.headers.get('host') || 'playlistlivefestival.letsplaymaker.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const domainUrl = `${protocol}://${host}`;

    // 3. Dispatch the single email
    const sendResult = await sendQueuedEmail({
      settings: smtpSettings,
      toEmail: queueItem.email,
      toName: queueItem.name || 'Sobat Playlist',
      subject: campaign.subject,
      templateHtml: campaign.templateHtml,
      domainUrl,
    });

    if (sendResult.success) {
      await markEmailQueueSent(queueItem.id, campaign.id);
      return NextResponse.json({
        success: true,
        dispatched: true,
        recipient: {
          id: queueItem.id,
          email: queueItem.email,
          name: queueItem.name,
        },
        messageId: sendResult.messageId,
        message: `Berhasil mengirim email ke ${queueItem.email}`,
      });
    } else {
      await markEmailQueueFailed(queueItem.id, campaign.id, sendResult.error || 'Gagal mengirim');
      return NextResponse.json({
        success: false,
        dispatched: true,
        recipient: {
          id: queueItem.id,
          email: queueItem.email,
        },
        error: sendResult.error,
        message: `Gagal mengirim ke ${queueItem.email}: ${sendResult.error}`,
      });
    }
  } catch (err: any) {
    console.error('[Email Worker] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
