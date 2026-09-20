import { NextRequest, NextResponse } from 'next/server';
import {
  getEmailQueueFromDb,
  updateEmailCampaignStatus,
  resetFailedQueueItems,
} from '@/lib/db';

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

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
