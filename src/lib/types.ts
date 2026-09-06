export type ArtistCardSize = 'normal' | 'wide' | 'large' | 'extrawide';

export interface Artist {
  id: string;
  name: string;
  genre?: string;
  day?: string;
  time?: string;
  image?: string;
  logoUrl?: string;
  phaseId?: string;
  featured?: boolean;
  cardSize?: ArtistCardSize;
}

export interface LineupPhase {
  id: string;
  name: string; // e.g. "Phase 1"
  title: string; // e.g. "Phase 1 Lineup"
  active?: boolean;
}

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'number'
  | 'email'
  | 'phone';

export interface TenantFormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: string[];
  isPrimary?: boolean;
}

export function getDefaultTenantFormFields(): TenantFormField[] {
  return [
    {
      id: 'brandName',
      label: 'Nama Brand / Usaha F&B',
      type: 'text',
      placeholder: 'Contoh: Kopi Senja Bandung / Burger Boss',
      helperText: 'Nama usaha kuliner atau brand yang akan berpartisipasi',
      required: true,
      isPrimary: true,
    },
    {
      id: 'category',
      label: 'Kategori Menu F&B',
      type: 'dropdown',
      placeholder: 'Pilih Kategori',
      helperText: 'Pilih kategori utama hidangan Anda',
      required: true,
      options: [
        'Makanan Berat (Main Course)',
        'Minuman / Coffee / Tea',
        'Snack / Camilan / Street Food',
        'Dessert / Pastry / Ice Cream',
        'Food Truck / Pop-up Kitchen',
        'Lainnya',
      ],
      isPrimary: true,
    },
    {
      id: 'menuDescription',
      label: 'Deskripsi Menu & Produk Unggulan',
      type: 'textarea',
      placeholder: 'Jelaskan menu andalan, keunikan rasa, dan konsep booth Anda...',
      helperText: 'Ceritakan menu favorit yang akan Anda jual di festival',
      required: false,
      isPrimary: true,
    },
    {
      id: 'priceRange',
      label: 'Rentang Harga Menu (Price Range)',
      type: 'radio',
      helperText: 'Kisaran harga rata-rata per porsi',
      required: false,
      options: [
        'Di bawah Rp 25.000',
        'Rp 25.000 - Rp 50.000',
        'Rp 50.000 - Rp 75.000',
        'Di atas Rp 75.000',
      ],
      isPrimary: true,
    },
    {
      id: 'instagramCatalog',
      label: 'Akun Instagram / Link Foto Menu',
      type: 'text',
      placeholder: 'Contoh: @brandkuliner atau https://instagram.com/...',
      helperText: 'Tautan media sosial atau portofolio produk Anda',
      required: false,
      isPrimary: true,
    },
    {
      id: 'picName',
      label: 'Nama Lengkap PIC / Owner',
      type: 'text',
      placeholder: 'Nama lengkap penanggung jawab',
      helperText: 'Nama penanggung jawab operasional booth',
      required: true,
      isPrimary: true,
    },
    {
      id: 'whatsapp',
      label: 'Nomor WhatsApp PIC',
      type: 'phone',
      placeholder: '081234567890',
      helperText: 'Pastikan nomor WhatsApp aktif untuk verifikasi dan konfirmasi kurasi',
      required: true,
      isPrimary: true,
    },
    {
      id: 'email',
      label: 'Alamat Email PIC / Bisnis',
      type: 'email',
      placeholder: 'nama@email.com',
      helperText: 'Email untuk pengiriman proposal dan invoice teknis',
      required: false,
      isPrimary: true,
    },
    {
      id: 'city',
      label: 'Kota Domisili Brand / Usaha',
      type: 'text',
      placeholder: 'Contoh: Bandung / Jakarta / Cimahi',
      required: false,
      isPrimary: true,
    },
    {
      id: 'powerRequirement',
      label: 'Kebutuhan Daya Listrik Booth',
      type: 'dropdown',
      placeholder: 'Pilih Kebutuhan Daya',
      helperText: 'Estimasi konsumsi daya listrik total peralatan booth',
      required: false,
      options: [
        'Tidak Butuh Daya Listrik',
        '< 900 Watt (Standar)',
        '900 - 1300 Watt',
        '1300 - 2200 Watt',
        '> 2200 Watt (High Power)',
      ],
      isPrimary: true,
    },
    {
      id: 'equipmentList',
      label: 'Daftar Peralatan Listrik yang Dibawa',
      type: 'textarea',
      placeholder: 'Contoh: 1x Deep Fryer (1000W), 1x Blender (300W), Lampu LED...',
      helperText: 'Rincikan seluruh alat elektronik yang memerlukan colokan',
      required: false,
      isPrimary: true,
    },
    {
      id: 'eventExperience',
      label: 'Pengalaman Mengikuti Event / Festival Sebelumnya',
      type: 'textarea',
      placeholder: 'Contoh: Playlist Live Festival 2023, Now Playing Fest 2024...',
      helperText: 'Sebutkan festival atau bazaar yang pernah Anda ikuti',
      required: false,
      isPrimary: true,
    },
  ];
}

export interface SiteConfig {
  // Main Hero & Event Info
  eventTitleFirst: string;
  eventTitleSecond: string;
  eventSubtitle: string;
  topBadgeText?: string;
  ticketUrl: string;
  buyButtonText: string;
  ticketStatusText: string;
  showTicketStatus: boolean;

  // Theme & Features
  theme: 'light' | 'dark' | 'festival';
  showCountdown: boolean;
  targetDate: string;
  showLineup: boolean;
  lineupPhases?: LineupPhase[];
  activePhaseId?: string;
  lineup: Artist[];

  // Video Teaser / Preview Feature
  showVideoSection: boolean;
  videoTitle: string;
  videoSubtitle: string;
  videoEmbedUrl: string;
  videoCoverImage: string;

  // Venue & Spotify
  showVenueMap: boolean;
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  showSpotify: boolean;
  spotifyEmbedUrl: string;
  showSoundEffects: boolean;

  // Affiliate Registration Feature
  showAffiliateSection: boolean;
  affiliateButtonText: string;
  affiliateTitle: string;
  affiliateSubtitle: string;
  affiliateWaGroupUrl: string;
  affiliateGoogleSheetWebhook: string;
  showAffiliateCountdown?: boolean;
  affiliateTargetDate?: string;

  // Compensation Form Feature
  showCompensationSection: boolean;
  showCompensationHeroBanner?: boolean;
  showCompensationCuration: boolean;
  compensationButtonText: string;
  compensationTitle: string;
  compensationSubtitle: string;
  compensationWaGroupUrl: string;
  compensationGoogleSheetWebhook: string;
  showCompensationStartCountdown?: boolean;
  compensationStartDate?: string;
  showCompensationCountdown?: boolean;
  compensationTargetDate?: string;

  // Tenant F&B Registration Feature
  showTenantSection: boolean;
  tenantButtonText: string;
  tenantTitle: string;
  tenantSubtitle: string;
  tenantWaGroupUrl: string;
  tenantGoogleSheetWebhook: string;
  showTenantCountdown?: boolean;
  tenantTargetDate?: string;
  tenantFormFields?: TenantFormField[];

  // Tracking & Pixels
  metaPixelId: string;
  tikTokPixelId: string;
  googleTagId: string;
  customHeadScripts: string;

  // SEO & OpenGraph
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;

  // Analytics
  buyNowClicksCount: number;
}
