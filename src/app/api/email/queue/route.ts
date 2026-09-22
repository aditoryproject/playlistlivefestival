import { NextRequest, NextResponse } from 'next/server';
import {
  getEmailQueueFromDb,
  updateEmailCampaignStatus,
  resetFailedQueueItems,
  getSmtpSettingsFromDb,
  getDbPool,
} from '@/lib/db';
import { sendQueuedEmail } from '@/lib/emailSender';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') ? Number(searchParams.get('campaignId')) : undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const data = await getEmailQueueFromDb({
      campaignId,
      status,
      search,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      items: data.items,
      total: data.total,
      sentToday: data.sentToday,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, campaignId, status } = body;

    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'Campaign ID diperlukan' }, { status: 400 });
    }

    if (action === 'update_status') {
      if (!['running', 'paused', 'completed'].includes(status)) {
        return NextResponse.json({ success: false, error: 'Status tidak valid' }, { status: 400 });
      }

      const updated = await updateEmailCampaignStatus(Number(campaignId), status);
      return NextResponse.json({ success: updated, message: `Status berhasil diubah menjadi ${status}` });
    }

    if (action === 'reset_failed') {
      const count = await resetFailedQueueItems(Number(campaignId));
      return NextResponse.json({
        success: true,
        message: `${count} email gagal berhasil dikembalikan ke status antrean (pending).`,
        count,
      });
    }

    if (action === 'resend_now') {
      const { queueItemId } = body;
      if (!queueItemId) {
        return NextResponse.json({ success: false, error: 'Queue Item ID diperlukan' }, { status: 400 });
      }

      const db = getDbPool();
      if (!db) {
        return NextResponse.json({ success: false, error: 'Database tidak terhubung' }, { status: 500 });
      }

      // 1. Get SMTP settings
      const smtpSettings = await getSmtpSettingsFromDb();
      if (!smtpSettings || !smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
        return NextResponse.json({ success: false, error: 'Pengaturan SMTP belum lengkap di tab Pengaturan SMTP' }, { status: 400 });
      }

      // 2. Get item & campaign
      const [itemRows]: any = await db.query(
        `SELECT id, campaign_id as campaignId, name, email, status FROM email_queue WHERE id = ?`,
        [queueItemId]
      );
      if (!itemRows || itemRows.length === 0) {
        return NextResponse.json({ success: false, error: 'Item antrean tidak ditemukan' }, { status: 404 });
      }
      const item = itemRows[0];

      const [campaignRows]: any = await db.query(
        `SELECT id, subject, template_html as templateHtml FROM email_campaigns WHERE id = ?`,
        [item.campaignId]
      );
      if (!campaignRows || campaignRows.length === 0) {
        return NextResponse.json({ success: false, error: 'Campaign tidak ditemukan' }, { status: 404 });
      }
      const camp = campaignRows[0];

      const host = req.headers.get('host') || 'playlistlivefestival.letsplaymaker.com';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const domainUrl = `${protocol}://${host}`;

      // 3. Dispatch immediately
      const sendResult = await sendQueuedEmail({
        settings: smtpSettings,
        toEmail: item.email,
        toName: item.name || 'Sobat Playlist',
        subject: camp.subject,
        templateHtml: camp.templateHtml,
        domainUrl,
      });

      if (sendResult.success) {
        const nowSql = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.query(
          `UPDATE email_queue SET status = 'sent', sent_at = ?, error_message = NULL WHERE id = ?`,
          [nowSql, item.id]
        );
        if (item.status !== 'sent') {
          await db.query(
            `UPDATE email_campaigns SET sent_count = sent_count + 1, last_sent_at = ? WHERE id = ?`,
            [nowSql, item.campaignId]
          );
        }
        return NextResponse.json({
          success: true,
          message: `Berhasil mengirim ulang email ke ${item.email}!`,
          response: sendResult.response,
        });
      } else {
        await db.query(
          `UPDATE email_queue SET status = 'failed', error_message = ? WHERE id = ?`,
          [sendResult.error?.slice(0, 500) || 'Gagal kirim ulang', item.id]
        );
        return NextResponse.json({
          success: false,
          error: sendResult.error || 'Gagal mengirim ulang email',
        }, { status: 400 });
      }
    }

    if (action === 'resend_item' || action === 'reset_to_pending') {
      const { queueItemId } = body;
      if (!queueItemId) {
        return NextResponse.json({ success: false, error: 'Queue Item ID diperlukan' }, { status: 400 });
      }
      const db = getDbPool();
      if (db) {
        await db.query(
          `UPDATE email_queue SET status = 'pending', sent_at = NULL, error_message = NULL WHERE id = ?`,
          [queueItemId]
        );
      }
      return NextResponse.json({ success: true, message: `Item #${queueItemId} berhasil dikembalikan ke antrean.` });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
