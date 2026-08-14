import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getUploadsDir } from '@/lib/uploads';

// Security Config for File Uploads
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif', '.pdf']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/avif',
  'application/pdf',
  'application/octet-stream',
]);

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // SECURITY 1: Rate Limiting - Max 200 uploads / 10 minutes per IP (Admin CMS upload friendly)
    const rateLimit = checkRateLimit(`upload_${clientIp}`, 200, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Batas upload terlampaui. Silakan tunggu beberapa saat.' },
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
        { success: false, error: 'Ukuran file terlalu besar. Maksimal 10 MB.' },
        { status: 400 }
      );
    }

    // SECURITY 3: Extension Whitelist Check (Anti-Malware / Anti-RCE)
    const rawExt = path.extname(file.name).toLowerCase();
    if (!rawExt || !ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak diizinkan. Hanya file gambar (JPG, PNG, WEBP, SVG, GIF, AVIF) yang diperbolehkan.' },
        { status: 400 }
      );
    }

    // SECURITY 4: MIME Type Check (Allow empty or standard image types)
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Tipe MIME file tidak valid.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // SECURITY 5: Generate Safe Random UUID Filename (Anti Path Traversal)
    const safeFilename = `${crypto.randomUUID()}${rawExt}`;

    const uploadDir = getUploadsDir();
    const filePath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    // Sync write to parent public/uploads if process.cwd() is inside .next/standalone
    if (process.cwd().includes('.next')) {
      try {
        const parentDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
        if (fs.existsSync(parentDir)) {
          fs.writeFileSync(path.join(parentDir, safeFilename), buffer);
        }
      } catch (e) {
        // Ignore sync error
      }
    }

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
