import { NextRequest, NextResponse } from 'next/server';
import {
  importMasterBuyers2024,
  getMasterBuyersCount,
  clearMasterBuyers2024,
  MasterBuyer2024Record,
} from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`master_upload_${clientIp}`, 20, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi.' },
        { status: 429 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let records: MasterBuyer2024Record[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'File CSV tidak ditemukan.' }, { status: 400 });
      }

      const text = await file.text();
      records = parseCsvToRecords(text);
    } else {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body.records)) {
        records = body.records;
      }
    }

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data valid yang dapat diekstrak dari CSV.' },
        { status: 400 }
      );
    }

    const importedCount = await importMasterBuyers2024(records);
    const totalCount = await getMasterBuyersCount();

    return NextResponse.json({
      success: true,
      imported: importedCount,
      total: totalCount,
    });
  } catch (error: any) {
    console.error('Error importing master buyers 2024:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengimpor data master 2024.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await getMasterBuyersCount();
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Error getting master buyers count:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil info master pembeli.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearMasterBuyers2024();
    return NextResponse.json({ success: true, count: 0 });
  } catch (error) {
    console.error('Error clearing master buyers:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data master.' }, { status: 500 });
  }
}

/**
 * Flexible CSV Parser for Master Buyers
 */
function parseCsvToRecords(csvText: string): MasterBuyer2024Record[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  // Parse header line
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map((h) => h.trim().toLowerCase());

  // Find column indices
  let emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('e-mail'));
  let phoneIdx = headers.findIndex(
    (h) => h.includes('phone') || h.includes('telepon') || h.includes('hp') || h.includes('whatsapp') || h.includes('wa')
  );
  let nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('nama'));
  let qtyIdx = headers.findIndex(
    (h) => h.includes('qty') || h.includes('quantity') || h.includes('jumlah') || h.includes('ticket')
  );

  // Fallback defaults if headers don't strictly match
  if (emailIdx === -1) emailIdx = 8; // Default Column I in Excel sample
  if (phoneIdx === -1) phoneIdx = 9; // Default Column J in Excel sample
  if (nameIdx === -1) nameIdx = 7; // Default Column H in Excel sample
  if (qtyIdx === -1) qtyIdx = 4; // Default Column E in Excel sample

  const results: MasterBuyer2024Record[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.length === 0) continue;

    const email = row[emailIdx] ? row[emailIdx].trim().toLowerCase() : '';
    const phone = row[phoneIdx] ? row[phoneIdx].trim() : '';
    const name = row[nameIdx] ? row[nameIdx].trim() : '';

    let qty = 1;
    if (qtyIdx !== -1 && row[qtyIdx]) {
      const parsedQty = parseInt(row[qtyIdx].replace(/\D/g, ''), 10);
      if (!isNaN(parsedQty) && parsedQty > 0) {
        qty = parsedQty;
      }
    }

    if (email || phone) {
      results.push({
        email,
        phone,
        name,
        qtyTicket: qty,
      });
    }
  }

  return results;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
