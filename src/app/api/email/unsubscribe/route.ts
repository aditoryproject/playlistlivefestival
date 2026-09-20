import { NextRequest, NextResponse } from 'next/server';
import { addEmailUnsubscribe } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (email && email.includes('@')) {
    await addEmailUnsubscribe(email, 'Unsubscribe via direct link');
  }

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Berhenti Berlangganan - Playlist Live Festival</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      background-color: #0f1117;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 20px;
      padding: 36px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    h1 {
      font-size: 22px;
      margin-bottom: 12px;
      color: #ffffff;
    }
    p {
      color: #a1a1aa;
      font-size: 14px;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      background: rgba(219, 84, 148, 0.15);
      color: #f472b6;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Playlist Live Festival</div>
    <h1>Kamu Telah Berhenti Berlangganan</h1>
    <p>Email <strong>${email || 'kamu'}</strong> telah berhasil dihapus dari daftar penerima newsletter Playlist Live Festival.</p>
    <p style="margin-top: 24px; font-size: 12px; color: #71717a;">
      Kamu tidak akan menerima email promosi lagi dari kami. Jika ini tidak sengaja, kamu bisa mendaftar kembali di website resmi kami.
    </p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, reason } = body;
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Email tidak valid' }, { status: 400 });
    }

    await addEmailUnsubscribe(email, reason || 'API unsubscribe');
    return NextResponse.json({ success: true, message: 'Berhasil berhenti berlangganan' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
