import fs from 'fs';
import path from 'path';
import { getDbSiteConfig, saveDbSiteConfig, recordBuyNowClick } from './db';

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

export const defaultConfig: SiteConfig = {
  eventTitleFirst: 'Playlist',
  eventTitleSecond: 'Rewind 2026',
  eventSubtitle: 'Bandung | 14-15 November 2026',
  topBadgeText: 'Festival Experience by PLAYMAKER!',
  ticketUrl: 'https://loket.com',
  buyButtonText: 'Buy Now!',
  ticketStatusText: '🔥 Presale 1 • Limited Tickets Remaining!',
  showTicketStatus: true,

  theme: 'light',
  showCountdown: false,
  targetDate: '2026-11-14T15:00:00',
  showLineup: true,
  lineupPhases: [
    { id: 'phase-1', name: 'Phase 1', title: 'Phase 1 Lineup', active: true },
  ],
  activePhaseId: 'phase-1',
  lineup: [
    {
      id: '1',
      name: 'peterpan',
      genre: 'Pop Rock',
      day: 'Day 1',
      time: '20:30 WIB',
      phaseId: 'phase-1',
      featured: true,
      cardSize: 'extrawide',
    },
    {
      id: '2',
      name: 'BURGERKILL',
      genre: 'Metalcore',
      day: 'Day 2',
      time: '21:00 WIB',
      phaseId: 'phase-1',
      featured: true,
      cardSize: 'normal',
    },
    {
      id: '3',
      name: 'KOTAK',
      genre: 'Rock',
      day: 'Day 2',
      time: '16:45 WIB',
      phaseId: 'phase-1',
      featured: false,
      cardSize: 'normal',
    },
    {
      id: '4',
      name: 'GEISHA',
      genre: 'Pop',
      day: 'Day 2',
      time: '18:15 WIB',
      phaseId: 'phase-1',
      featured: false,
      cardSize: 'normal',
    },
    {
      id: '5',
      name: 'PERUNGGU',
      genre: 'Indie Rock',
      day: 'Day 1',
      time: '19:00 WIB',
      phaseId: 'phase-1',
      featured: true,
      cardSize: 'normal',
    },
    {
      id: '6',
      name: 'enau',
      genre: 'Folk Pop',
      day: 'Day 1',
      time: '17:30 WIB',
      phaseId: 'phase-1',
      featured: false,
      cardSize: 'normal',
    },
    {
      id: '7',
      name: 'Charly SETIA BAND',
      genre: 'Pop Rock',
      day: 'Day 1',
      time: '18:00 WIB',
      phaseId: 'phase-1',
      featured: false,
      cardSize: 'normal',
    },
    {
      id: '8',
      name: 'Gigi',
      genre: 'Pop Rock',
      day: 'Day 2',
      time: '20:00 WIB',
      phaseId: 'phase-1',
      featured: true,
      cardSize: 'large',
    },
    {
      id: '9',
      name: 't-Five',
      genre: 'R&B Pop',
      day: 'Day 1',
      time: '18:30 WIB',
      phaseId: 'phase-1',
      featured: false,
      cardSize: 'normal',
    },
    {
      id: '10',
      name: 'ARMAND MAULANA',
      genre: 'Pop',
      day: 'Day 1',
      time: '19:30 WIB',
      phaseId: 'phase-1',
      featured: false,
      cardSize: 'normal',
    },
    {
      id: '11',
      name: 'RONY PARULIAN',
      genre: 'Pop Rock',
      day: 'Day 1',
      time: '17:00 WIB',
      phaseId: 'phase-1',
      featured: false,
      cardSize: 'normal',
    },
    {
      id: '12',
      name: 'Letto',
      genre: 'Pop Rock',
      day: 'Day 2',
      time: '17:30 WIB',
      phaseId: 'phase-1',
      featured: false,
      cardSize: 'normal',
    },
    {
      id: '13',
      name: 'THE CHANGCUTERS',
      genre: 'Rock n Roll',
      day: 'Day 2',
      time: '19:15 WIB',
      phaseId: 'phase-1',
      featured: true,
      cardSize: 'normal',
    },
    {
      id: '14',
      name: 'KANGEN BAND',
      genre: 'Pop Melayu',
      day: 'Day 1',
      time: '21:00 WIB',
      phaseId: 'phase-1',
      featured: true,
      cardSize: 'normal',
    },
    {
      id: '15',
      name: 'ANDRA AND THE BACKBONE',
      genre: 'Rock',
      day: 'Day 2',
      time: '21:30 WIB',
      phaseId: 'phase-1',
      featured: true,
      cardSize: 'wide',
    },
  ],

  showVideoSection: false,
  videoTitle: 'Official Trailer Teaser - Playlist Rewind 2026',
  videoSubtitle: 'Rasakan atmosfir dan keseruan festival musik terbesar di Bandung!',
  videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
  videoCoverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',

  showVenueMap: false,
  venueName: 'Bandung',
  venueAddress: 'Jl. Hegarmanah No.152, Hegarmanah, Cidadap, Kota Bandung, Jawa Barat 40141',
  venueMapUrl: 'https://maps.google.com/maps?q=Bandung&t=&z=15&ie=UTF8&iwloc=&output=embed',
  showSpotify: false,
  spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
  showSoundEffects: true,

  showAffiliateSection: false,
  affiliateButtonText: 'Daftar Affiliate Playlist',
  affiliateTitle: 'Gabung Program Affiliate Playlist Rewind 2026',
  affiliateSubtitle: 'Dapatkan komisi menarik dan akses eksklusif dengan menjadi bagian dari tim promo Playlist!',
  affiliateWaGroupUrl: 'https://chat.whatsapp.com/',
  affiliateGoogleSheetWebhook: '',
  showAffiliateCountdown: false,
  affiliateTargetDate: '2026-10-31T23:59:59',


  showCompensationSection: false,
  showCompensationHeroBanner: true,
  showCompensationCuration: true,
  compensationButtonText: 'Klaim Kompensasi Tiket',
  compensationTitle: 'Kompensasi Tiket Playlist Live Super Festival 2024',
  compensationSubtitle: 'Kompensasi berupa Discount 50% dari harga PRESALE 1 - FESTIVAL 2 DAY PASS pada event Playlist Rewind Festival 2026',
  compensationWaGroupUrl: 'https://chat.whatsapp.com/',
  compensationGoogleSheetWebhook: '',
  showCompensationStartCountdown: false,
  compensationStartDate: '2026-08-15T12:00:00',
  showCompensationCountdown: false,
  compensationTargetDate: '2026-10-31T23:59:59',

  showTenantSection: false,
  tenantButtonText: 'Daftar Tenant F&B',
  tenantTitle: 'Open Recruitment Tenant F&B Playlist Rewind 2026',
  tenantSubtitle: 'Bergabunglah bersama puluhan ribu pengunjung di festival musik terbesar di Bandung!',
  tenantWaGroupUrl: 'https://chat.whatsapp.com/',
  tenantGoogleSheetWebhook: '',
  showTenantCountdown: false,
  tenantTargetDate: '2026-10-31T23:59:59',




  metaPixelId: '',
  tikTokPixelId: '',
  googleTagId: '',
  customHeadScripts: '',

  metaTitle: 'Playlist Rewind 2026 - Bandung | 14-15 November 2026',
  metaDescription: 'Beli tiket resmi Playlist Rewind 2026 Bandung pada 14-15 November 2026. Saksikan musisi dan artis favorit kamu secara langsung!',
  metaKeywords: 'Playlist Rewind 2026, Konser Bandung, Tiket Playlist Rewind, Festival Musik Bandung 2026',
  ogImage: '/og-image.jpg',
  ogTitle: 'Playlist Rewind 2026 - Bandung | 14-15 November 2026',
  ogDescription: 'Beli tiket resmi Playlist Rewind 2026 Bandung pada 14-15 November 2026. Saksikan musisi dan artis favorit kamu secara langsung!',
  canonicalUrl: 'https://playlistrewind.com',

  buyNowClicksCount: 0,
};

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'config.json');

export function sanitizeConfig(cfg: SiteConfig): SiteConfig {
  const c = { ...cfg };
  if (c.metaPixelId) c.metaPixelId = c.metaPixelId.trim();
  if (c.tikTokPixelId) c.tikTokPixelId = c.tikTokPixelId.trim();
  if (c.googleTagId) c.googleTagId = c.googleTagId.trim();
  if (!c.ogImage) {
    c.ogImage = '/og-image.jpg';
  }
  if (!c.ogTitle || c.ogTitle.includes('Secapa AD')) {
    c.ogTitle = c.metaTitle || 'Playlist Rewind 2026 - Bandung | 14-15 November 2026';
  }
  if (!c.ogDescription || c.ogDescription.includes('Secapa AD')) {
    c.ogDescription = c.metaDescription || 'Beli tiket resmi Playlist Rewind 2026 Bandung pada 14-15 November 2026.';
  }
  if (c.videoSubtitle?.includes('Secapa AD')) {
    c.videoSubtitle = 'Rasakan atmosfir dan keseruan festival musik terbesar di Bandung!';
  }
  if (c.venueName?.includes('Secapa AD')) {
    c.venueName = 'Bandung';
  }

  // Ensure c.lineup exists and has valid deterministic unique string IDs & cardSize defaults
  if (!c.lineup || !Array.isArray(c.lineup)) {
    c.lineup = [...defaultConfig.lineup];
  }

  // Deduplicate lineup by artist name (keep first occurrence, discard duplicates)
  // This removes the "two BURGERKILL" corrupt data problem
  const seenNames = new Set<string>();
  c.lineup = c.lineup.filter((art) => {
    const nameKey = (art.name || '').toUpperCase().trim();
    if (!nameKey || seenNames.has(nameKey)) return false;
    seenNames.add(nameKey);
    return true;
  });

  // Assign deterministic stable IDs
  const seenIds = new Set<string>();
  c.lineup = c.lineup.map((art, idx) => {
    const rawId = art.id ? String(art.id).trim() : '';
    const nameSlug = (art.name || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist';
    let validId = rawId;

    if (!validId || seenIds.has(validId)) {
      validId = `artist-${idx + 1}-${nameSlug}`;
    }
    seenIds.add(validId);

    const matchDef = defaultConfig.lineup.find(
      (d) => d.name.toLowerCase().trim() === art.name.toLowerCase().trim()
    );
    return {
      ...art,
      id: validId,
      logoUrl: art.logoUrl || '',
      image: '',
      cardSize: art.cardSize || matchDef?.cardSize || 'normal',
    };
  });

  return c;
}

/**
 * Synchronous local JSON config reader (legacy & static render fallback)
 */
export function getSiteConfig(): SiteConfig {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dataFilePath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      return sanitizeConfig(defaultConfig);
    }
    const fileData = fs.readFileSync(dataFilePath, 'utf-8');
    const parsed = JSON.parse(fileData);
    return sanitizeConfig({ ...defaultConfig, ...parsed });
  } catch (error) {
    console.error('Error reading site config file:', error);
    return sanitizeConfig(defaultConfig);
  }
}

/**
 * Async config reader: tries MySQL first, falls back to JSON file.
 * Also restores any default artists missing from MySQL (e.g. KOTAK deleted by corrupt data).
 */
export async function getSiteConfigAsync(): Promise<SiteConfig> {
  // 1. Try MySQL Database
  const dbConfig = await getDbSiteConfig();
  if (dbConfig) {
    const sanitized = sanitizeConfig({ ...defaultConfig, ...dbConfig });

    // Restore any default artists that are missing from the MySQL lineup
    // This fixes cases where MySQL data lost an artist (e.g. KOTAK) due to corruption.
    const existingNames = new Set(
      sanitized.lineup.map((a) => a.name.toLowerCase().trim())
    );
    const missingArtists = defaultConfig.lineup.filter(
      (a) => !existingNames.has(a.name.toLowerCase().trim())
    );
    if (missingArtists.length > 0) {
      // Insert missing artists at their original positions from defaultConfig
      const rebuiltLineup: typeof sanitized.lineup = [];
      const currentByName = new Map(
        sanitized.lineup.map((a) => [a.name.toLowerCase().trim(), a])
      );
      for (const def of defaultConfig.lineup) {
        const nameKey = def.name.toLowerCase().trim();
        if (currentByName.has(nameKey)) {
          rebuiltLineup.push(currentByName.get(nameKey)!);
        } else {
          // Artist was missing from MySQL — restore from defaultConfig
          rebuiltLineup.push({ ...def });
        }
      }
      // Append any extra artists that exist in MySQL but not in defaultConfig
      for (const art of sanitized.lineup) {
        const nameKey = art.name.toLowerCase().trim();
        if (!defaultConfig.lineup.find((d) => d.name.toLowerCase().trim() === nameKey)) {
          rebuiltLineup.push(art);
        }
      }
      sanitized.lineup = rebuiltLineup;
    }

    return sanitized;
  }

  // 2. Fallback to Local JSON file
  return getSiteConfig();
}

/**
 * Synchronous local JSON config saver
 */
export function saveSiteConfig(newConfig: Partial<SiteConfig>): SiteConfig {
  try {
    const current = getSiteConfig();
    const updated = sanitizeConfig({ ...current, ...newConfig });
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (error) {
    console.error('Error saving site config file:', error);
    throw error;
  }
}

/**
 * Async config saver: updates MySQL DB AND syncs to local JSON file
 */
export async function saveSiteConfigAsync(newConfig: Partial<SiteConfig>): Promise<SiteConfig> {
  // IMPORTANT: read current config only for non-lineup fields.
  // The incoming newConfig.lineup (if provided) MUST win completely — never merge with stale DB lineup.
  const current = await getSiteConfigAsync();

  const merged: Partial<SiteConfig> = { ...current, ...newConfig };

  // If the caller provides an explicit lineup array, use it as-is (do not let old DB data bleed in)
  if (Array.isArray(newConfig.lineup)) {
    merged.lineup = newConfig.lineup;
  }

  const updated = sanitizeConfig(merged as SiteConfig);

  // Save to MySQL DB if available
  await saveDbSiteConfig(updated);

  // Sync to local JSON file as backup
  saveSiteConfig(updated);

  return updated;
}

/**
 * Increment Buy Now click counter in DB and file
 */
export async function incrementBuyNowClickAsync(userAgent?: string, ipAddress?: string): Promise<number> {
  const current = await getSiteConfigAsync();
  const newCount = (current.buyNowClicksCount || 0) + 1;

  // Log detailed analytics event into MySQL table
  await recordBuyNowClick(userAgent, ipAddress);

  // Save updated click count
  await saveSiteConfigAsync({ buyNowClicksCount: newCount });

  return newCount;
}

export function incrementBuyNowClick(): number {
  const current = getSiteConfig();
  const newCount = (current.buyNowClicksCount || 0) + 1;
  saveSiteConfig({ buyNowClicksCount: newCount });
  return newCount;
}
