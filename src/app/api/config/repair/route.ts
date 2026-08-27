import { NextResponse } from 'next/server';
import { getDbSiteConfig, saveDbSiteConfig } from '@/lib/db';
import { getSiteConfig, saveSiteConfig } from '@/lib/config';

/**
 * GET /api/config/repair
 * One-time repair endpoint:
 * - Removes duplicate artist name entries from lineup
 * - Clears cross-contaminated logo URLs (same URL assigned to 2+ different bands)
 * - Writes clean data back to MySQL AND local config.json
 */
export async function GET() {
  try {
    // Read raw data from MySQL (without sanitize to see the true corrupt state)
    const rawDbConfig = await getDbSiteConfig();
    const fileConfig = getSiteConfig();
    const base = rawDbConfig || fileConfig;

    if (!base || !Array.isArray(base.lineup)) {
      return NextResponse.json({ success: false, error: 'No lineup found in config' });
    }

    const originalLineup = base.lineup;

    // Step 1: Deduplicate by name (keep first occurrence)
    const seenNames = new Set<string>();
    let dedupedLineup = originalLineup.filter((art) => {
      const nameKey = (art.name || '').toUpperCase().trim();
      if (!nameKey || seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    });

    // Step 2: Clear any cross-contaminated logos (same URL used by 2+ bands)
    const logoOwners = new Map<string, string>(); // url -> first artist name that has it
    dedupedLineup = dedupedLineup.map((art) => {
      const nameKey = (art.name || '').toUpperCase().trim();
      const logo = art.logoUrl || '';
      if (!logo) return art;

      const owner = logoOwners.get(logo);
      if (owner && owner !== nameKey) {
        // Another band already claimed this logo → clear for this band
        return { ...art, logoUrl: '', image: '' };
      }
      logoOwners.set(logo, nameKey);
      return { ...art, image: '' };
    });

    const cleanConfig = { ...base, lineup: dedupedLineup };

    // Save to MySQL
    let dbSaved = false;
    if (rawDbConfig) {
      dbSaved = await saveDbSiteConfig(cleanConfig as any);
    }
    // Always sync to local file
    saveSiteConfig(cleanConfig as any);

    return NextResponse.json({
      success: true,
      message: 'Lineup repaired successfully',
      before: {
        count: originalLineup.length,
        names: originalLineup.map((a) => ({ name: a.name, logoUrl: a.logoUrl || '' })),
      },
      after: {
        count: dedupedLineup.length,
        names: dedupedLineup.map((a) => ({ name: a.name, logoUrl: a.logoUrl || '' })),
      },
      dbSaved,
    });
  } catch (err: any) {
    console.error('[/api/config/repair] Error:', err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}
