import { NextRequest, NextResponse } from 'next/server';
import {
  getEmailCampaignsFromDb,
  createEmailCampaignWithRecipients,
  deleteEmailCampaign,
  updateEmailCampaignStatus,
} from '@/lib/db';
import { DEFAULT_EMAIL_HTML_TEMPLATE, DEFAULT_EMAIL_SUBJECT } from '@/lib/emailTemplate';

export async function GET() {
  try {
    const campaigns = await getEmailCampaignsFromDb();
    return NextResponse.json({ success: true, campaigns });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subject,
      templateHtml,
      intervalMinutes,
      dailyLimit,
      activeHoursStart,
      activeHoursEnd,
      rawRecipientsText,
      recipientsList,
      status,
    } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json({ success: false, error: 'Subjek email wajib diisi.' }, { status: 400 });
    }

    // Parse recipients from either raw text or array
    const parsedRecipients: Array<{ name: string; email: string }> = [];

    if (Array.isArray(recipientsList) && recipientsList.length > 0) {
      recipientsList.forEach((r) => {
        if (r && r.email) {
          parsedRecipients.push({
            name: r.name || '',
            email: r.email.trim(),
          });
        }
      });
    } else if (rawRecipientsText && typeof rawRecipientsText === 'string') {
      // Parse CSV/TSV/Lines: "name, email" or "email" or "name \t email"
      const lines = rawRecipientsText.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if comma or tab separated
        if (trimmed.includes(',')) {
          const parts = trimmed.split(',');
          if (parts.length >= 2) {
            // Check if first part looks like email or name
            if (parts[0].includes('@')) {
              parsedRecipients.push({ email: parts[0].trim(), name: parts[1].trim() });
            } else {
              parsedRecipients.push({ name: parts[0].trim(), email: parts[1].trim() });
            }
          } else {
            parsedRecipients.push({ name: '', email: parts[0].trim() });
          }
        } else if (trimmed.includes('\t')) {
          const parts = trimmed.split('\t');
          if (parts.length >= 2) {
            if (parts[0].includes('@')) {
              parsedRecipients.push({ email: parts[0].trim(), name: parts[1].trim() });
            } else {
              parsedRecipients.push({ name: parts[0].trim(), email: parts[1].trim() });
            }
          } else {
            parsedRecipients.push({ name: '', email: parts[0].trim() });
          }
        } else if (trimmed.includes('@')) {
          // Plain email
          parsedRecipients.push({ name: '', email: trimmed });
        }
      }
    }

    if (parsedRecipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Daftar penerima kosong atau tidak ada format email yang valid.' },
        { status: 400 }
      );
    }

    let finalHtml = templateHtml;
    if (
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

    const campaign = {
      title: (title || 'Nostalgia Festival Blast').trim(),
      subject: (subject || DEFAULT_EMAIL_SUBJECT).trim(),
      templateHtml: finalHtml,
      intervalMinutes: Math.max(1, Number(intervalMinutes) || 8),
      dailyLimit: Math.max(5, Number(dailyLimit) || 80),
      activeHoursStart: Number(activeHoursStart) ?? 8,
      activeHoursEnd: Number(activeHoursEnd) ?? 21,
      status: status === 'running' ? ('running' as const) : ('paused' as const),
    };

    const result = await createEmailCampaignWithRecipients(campaign, parsedRecipients);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat campaign dan memasukkan ${result.count} email ke antrean!`,
      campaignId: result.campaignId,
      count: result.count,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('id');
    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'Campaign ID diperlukan' }, { status: 400 });
    }

    const deleted = await deleteEmailCampaign(Number(campaignId));
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
