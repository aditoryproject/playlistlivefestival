import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Security Config for File Uploads
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // SECURITY 1: Rate Limiting - Max 10 uploads / 10 minutes per IP (Anti-Flooding)
    const rateLimit = checkRateLimit(`upload_${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Batas upload terlampaui. Silakan tunggu beberapa menit.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
    }

    // SECURITY 2: File Size Limit Check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file terlalu besar. Maksimal 5 MB.' },
        { status: 400 }
      );
    }

    // SECURITY 3: Extension Whitelist Check (Anti-Malware / Anti-RCE)
    const rawExt = path.extname(file.name).toLowerCase();
    const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.png';

    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak diizinkan. Hanya file gambar (JPG, PNG, WEBP, SVG) yang diperbolehkan.' },
        { status: 400 }
      );
    }

    // SECURITY 4: MIME Type Check
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipe MIME file tidak valid.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // SECURITY 5: Generate Safe Random UUID Filename (Anti Path Traversal)
    const safeFilename = `${crypto.randomUUID()}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengunggah file' },
      { status: 500 }
    );
  }
}
