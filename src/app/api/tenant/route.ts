import { NextRequest, NextResponse } from 'next/server';
import {
  recordTenantApplication,
  getTenantApplicationsFromDb,
  deleteTenantApplicationFromDb,
} from '@/lib/db';
import { getSiteConfigAsync } from '@/lib/config';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 5 submissions per 60 seconds per IP
    const rateLimit = checkRateLimit(`tenant_submit_${clientIp}`, 5, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const config = await getSiteConfigAsync();
    const formFields = config.tenantFormFields && config.tenantFormFields.length > 0
      ? config.tenantFormFields
      : [];

    const {
      brandName: rawBrandName,
      category: rawCategory,
      menuDescription: rawMenuDescription,
      priceRange: rawPriceRange,
      instagramCatalog: rawInstagramCatalog,
      picName: rawPicName,
      whatsapp: rawWhatsapp,
      email: rawEmail,
      city: rawCity,
      powerRequirement: rawPowerRequirement,
      equipmentList: rawEquipmentList,
      eventExperience: rawEventExperience,
      responses: rawResponses,
      customData: rawCustomData,
    } = body;

    // Collect responses into structured array
    let responses: { id: string; label: string; value: any; type?: string }[] = [];
    if (Array.isArray(rawResponses) && rawResponses.length > 0) {
      responses = rawResponses;
    } else if (formFields.length > 0) {
      // Build responses from body fields based on configured form fields
      responses = formFields.map((field) => {
        const val = body[field.id] !== undefined ? body[field.id] : '';
        return {
          id: field.id,
          label: field.label,
          value: Array.isArray(val) ? val.join(', ') : String(val ?? ''),
          type: field.type,
        };
      });
    }

    // Dynamic Validation against configured formFields
    if (formFields.length > 0) {
      for (const field of formFields) {
        if (field.required) {
          const resp = responses.find((r) => r.id === field.id);
          const val = resp ? resp.value : body[field.id];
          const isEmpty =
            val === undefined ||
            val === null ||
            (typeof val === 'string' && !val.trim()) ||
            (Array.isArray(val) && val.length === 0);

          if (isEmpty) {
            return NextResponse.json(
              { success: false, error: `Pertanyaan "${field.label}" wajib diisi.` },
              { status: 400 }
            );
          }
        }
      }
    } else {
      // Fallback standard validation
      if (!rawBrandName || !String(rawBrandName).trim()) {
        return NextResponse.json({ success: false, error: 'Nama Brand / Usaha wajib diisi.' }, { status: 400 });
      }
      if (!rawPicName || !String(rawPicName).trim()) {
        return NextResponse.json({ success: false, error: 'Nama Lengkap PIC / Owner wajib diisi.' }, { status: 400 });
      }
      if (!rawWhatsapp || !String(rawWhatsapp).trim()) {
        return NextResponse.json({ success: false, error: 'Nomor WhatsApp wajib diisi.' }, { status: 400 });
      }
    }

    // Helper to find value from responses or body
    const getValue = (key: string, fallbackVal: any = '') => {
      const match = responses.find((r) => r.id === key);
      if (match && match.value !== undefined && match.value !== '') {
        return typeof match.value === 'string' ? match.value : JSON.stringify(match.value);
      }
      return fallbackVal ? String(fallbackVal) : '';
    };

    const brandName = getValue('brandName', rawBrandName) || 'Tenant';
    const category = getValue('category', rawCategory) || 'Umum';
    const picName = getValue('picName', rawPicName) || '-';
    const whatsapp = getValue('whatsapp', rawWhatsapp) || '-';
    const email = getValue('email', rawEmail);
    const city = getValue('city', rawCity);
    const menuDescription = getValue('menuDescription', rawMenuDescription);
    const priceRange = getValue('priceRange', rawPriceRange);
    const instagramCatalog = getValue('instagramCatalog', rawInstagramCatalog);
    const powerRequirement = getValue('powerRequirement', rawPowerRequirement);
    const equipmentList = getValue('equipmentList', rawEquipmentList);
    const eventExperience = getValue('eventExperience', rawEventExperience);

    // 1. Record application to DB
    const application = await recordTenantApplication({
      brandName: brandName.trim(),
      category: category.trim(),
      menuDescription: menuDescription ? menuDescription.trim() : '',
      priceRange: priceRange ? priceRange.trim() : '',
      instagramCatalog: instagramCatalog ? instagramCatalog.trim() : '',
      picName: picName.trim(),
      whatsapp: whatsapp.trim(),
      email: email ? email.trim() : '',
      city: city ? city.trim() : '',
      powerRequirement: powerRequirement ? powerRequirement.trim() : '',
      equipmentList: equipmentList ? equipmentList.trim() : '',
      eventExperience: eventExperience ? eventExperience.trim() : '',
      customData: {
        ...(typeof rawCustomData === 'object' ? rawCustomData : {}),
        responses,
      },
      responses,
    });

    // Helper to preserve exact social media handle or URL without prepending playlist domain
    const cleanSocialOrText = (rawVal?: string) => {
      if (!rawVal) return '';
      let val = String(rawVal).trim();
      // Remove any unwanted playlist/playmaker host prefix if previously attached
      val = val.replace(/^https?:\/\/[^\/]*playlist[^\/]*\//i, '');
      val = val.replace(/^https?:\/\/[^\/]*letsplaymaker[^\/]*\//i, '');
      return val.trim();
    };

    // 2. Fetch site config for WA group URL & Google Sheets Webhook URL
    const waGroupUrl = config.tenantWaGroupUrl || 'https://chat.whatsapp.com/';
    const webhookUrl = config.tenantGoogleSheetWebhook;

    // 3. Optional: Sync to Google Sheets Webhook in background
    if (webhookUrl && webhookUrl.startsWith('http')) {
      const sanitizedResponses = responses.map((r) => ({
        id: r.id,
        label: r.label,
        value:
          r.id === 'instagramCatalog' || (r.label && r.label.toLowerCase().includes('instagram'))
            ? cleanSocialOrText(r.value)
            : r.value,
      }));

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
          createdAt: application.createdAt,
          brandName: application.brandName,
          category: application.category,
          menuDescription: application.menuDescription,
          priceRange: application.priceRange,
          instagramCatalog: cleanSocialOrText(application.instagramCatalog),
          picName: application.picName,
          whatsapp: application.whatsapp,
          email: application.email,
          city: application.city,
          powerRequirement: application.powerRequirement,
          equipmentList: application.equipmentList,
          eventExperience: application.eventExperience,
          responses: sanitizedResponses,
          responsesJson: JSON.stringify(sanitizedResponses),
        }),
      }).catch((err) => {
        console.error('[Tenant Webhook] Error posting to Google Sheets:', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: application,
      waGroupUrl,
    });
  } catch (error) {
    console.error('Error handling tenant submission:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await getTenantApplicationsFromDb();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching tenant applications:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data pendaftaran tenant.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak valid.' }, { status: 400 });
    }

    const deleted = await deleteTenantApplicationFromDb(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting tenant application:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data tenant.' }, { status: 500 });
  }
}
