import mysql from 'mysql2/promise';
import { SiteConfig } from './config';

// MySQL Connection Configuration from Environment Variables
const DB_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const DB_USER = process.env.MYSQL_USER || 'root';
const DB_PASSWORD = process.env.MYSQL_PASSWORD || '';
const DB_NAME = process.env.MYSQL_DATABASE || 'playlistweb';

let pool: mysql.Pool | null = null;
let isInitialized = false;

export interface VisitorLogInput {
  ipAddress?: string;
  city?: string;
  country?: string;
  referrer?: string;
  sourceCategory?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType?: string;
  browser?: string;
}

export interface VisitorLogItem extends VisitorLogInput {
  id: string | number;
  createdAt: string;
}

export interface AffiliateApplicationInput {
  fullName: string;
  whatsapp: string;
  email?: string;
  instagramTiktok?: string;
  city?: string;
  experience?: string;
}

export interface AffiliateApplicationItem extends AffiliateApplicationInput {
  id: string | number;
  createdAt: string;
  status: string;
}

export interface CompensationApplicationInput {
  fullName: string;
  identityNumber: string;
  ktpImageUrl: string;
  whatsapp: string;
  email: string;
  ticketProofUrl: string;
  ticketCount: string;
}

export interface CompensationApplicationItem extends CompensationApplicationInput {
  id: string | number;
  createdAt: string;
  status: string;
}

export interface MasterBuyer2024Record {
  id?: string | number;
  email: string;
  phone: string;
  name?: string;
  qtyTicket?: number;
}

export interface CurationEvaluation {
  status: 'VERIFIED_MATCH' | 'OVERCLAIM_WARNING' | 'UNMATCHED';
  purchasedQty: number;
  claimedQty: number;
  matchedBy: 'email' | 'phone' | 'both' | 'none';
  matchedBuyerName?: string;
}

export interface TenantApplicationInput {
  brandName?: string;
  category?: string;
  menuDescription?: string;
  priceRange?: string;
  instagramCatalog?: string;
  picName?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  powerRequirement?: string;
  equipmentList?: string;
  eventExperience?: string;
  customData?: Record<string, any>;
  responses?: { id: string; label: string; value: any; type?: string }[];
}

export interface TenantApplicationItem extends TenantApplicationInput {
  id: string | number;
  createdAt: string;
  status: string;
}

// In-Memory Fallback Store for Local Dev without MySQL
const memoryVisitorLogs: VisitorLogItem[] = [];
const memoryAffiliateApplications: AffiliateApplicationItem[] = [];
const memoryCompensationApplications: CompensationApplicationItem[] = [];
const memoryTenantApplications: TenantApplicationItem[] = [];
const memoryMasterBuyers2024: MasterBuyer2024Record[] = [];



/**
 * Get or initialize MySQL connection pool
 */
export function getDbPool(): mysql.Pool | null {
  if (!pool && process.env.MYSQL_HOST) {
    try {
      pool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '50', 10),
        queueLimit: 0,
      });
    } catch (err) {
      console.warn('[MySQL DB] Could not initialize connection pool:', err);
      pool = null;
    }
  }
  return pool;
}

/**
 * Initialize database schema if MySQL server is available
 */
export async function initDatabase(): Promise<boolean> {
  if (isInitialized) return true;
  const db = getDbPool();
  if (!db) return false;

  try {
    // 1. Config table
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(50) NOT NULL UNIQUE DEFAULT 'default_config',
        config_json LONGTEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_config_key (config_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Buy Now analytics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS buy_now_analytics (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_agent VARCHAR(255) NULL,
        ip_address VARCHAR(45) NULL,
        INDEX idx_clicked_at (clicked_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Visitor Traffic Analytics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NULL,
        city VARCHAR(100) DEFAULT 'Unknown',
        country VARCHAR(100) DEFAULT 'Indonesia',
        referrer VARCHAR(255) DEFAULT 'Direct',
        source_category VARCHAR(50) DEFAULT 'Direct / Bookmark',
        utm_source VARCHAR(100) NULL,
        utm_medium VARCHAR(100) NULL,
        utm_campaign VARCHAR(100) NULL,
        device_type VARCHAR(50) DEFAULT 'Mobile',
        browser VARCHAR(50) DEFAULT 'Chrome',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_source (source_category),
        INDEX idx_city (city)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Affiliate Applications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS affiliate_applications (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        whatsapp VARCHAR(30) NOT NULL,
        email VARCHAR(150) NULL,
        instagram_tiktok VARCHAR(150) NULL,
        city VARCHAR(100) NULL,
        experience TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        INDEX idx_affiliate_created (created_at),
        INDEX idx_affiliate_whatsapp (whatsapp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Compensation Applications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS compensation_applications (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        identity_number VARCHAR(50) NOT NULL,
        ktp_image_url TEXT NOT NULL,
        whatsapp VARCHAR(30) NOT NULL,
        email VARCHAR(150) NOT NULL,
        ticket_proof_url TEXT NOT NULL,
        ticket_count VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        INDEX idx_compensation_created (created_at),
        INDEX idx_compensation_whatsapp (whatsapp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Master Buyers 2024 table
    await db.query(`
      CREATE TABLE IF NOT EXISTS master_buyers_2024 (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        name VARCHAR(150) NULL,
        qty_ticket INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_master_email (email),
        INDEX idx_master_phone (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Tenant F&B Applications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tenant_applications (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        brand_name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        menu_description TEXT NULL,
        price_range VARCHAR(100) NULL,
        instagram_catalog VARCHAR(255) NULL,
        pic_name VARCHAR(150) NOT NULL,
        whatsapp VARCHAR(30) NOT NULL,
        email VARCHAR(150) NULL,
        city VARCHAR(100) NULL,
        power_requirement VARCHAR(50) NULL,
        equipment_list TEXT NULL,
        event_experience TEXT NULL,
        custom_data LONGTEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        INDEX idx_tenant_created (created_at),
        INDEX idx_tenant_whatsapp (whatsapp),
        INDEX idx_tenant_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure custom_data column exists on legacy tables
    try {
      await db.query(`ALTER TABLE tenant_applications ADD COLUMN custom_data LONGTEXT NULL`);
    } catch (e) {
      // Column might already exist, ignore error
    }

    // 8. Email SMTP Settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_smtp_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host VARCHAR(255) NOT NULL,
        port INT NOT NULL DEFAULT 465,
        secure TINYINT(1) NOT NULL DEFAULT 1,
        user VARCHAR(255) NOT NULL,
        pass VARCHAR(255) NOT NULL,
        from_email VARCHAR(255) NOT NULL,
        from_name VARCHAR(255) NOT NULL DEFAULT 'Playlist Live Festival',
        reply_to VARCHAR(255) NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Email Blast Campaigns table
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        template_html LONGTEXT NOT NULL,
        interval_minutes INT NOT NULL DEFAULT 8,
        daily_limit INT NOT NULL DEFAULT 80,
        active_hours_start INT NOT NULL DEFAULT 8,
        active_hours_end INT NOT NULL DEFAULT 21,
        status VARCHAR(30) NOT NULL DEFAULT 'paused',
        total_recipients INT NOT NULL DEFAULT 0,
        sent_count INT NOT NULL DEFAULT 0,
        failed_count INT NOT NULL DEFAULT 0,
        last_sent_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_campaign_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Email Queue Items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_queue (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        campaign_id BIGINT NOT NULL,
        name VARCHAR(150) NULL,
        email VARCHAR(190) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        scheduled_at DATETIME NULL,
        sent_at DATETIME NULL,
        error_message TEXT NULL,
        retry_count INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_queue_campaign (campaign_id),
        INDEX idx_queue_status (status),
        INDEX idx_queue_scheduled (scheduled_at),
        INDEX idx_queue_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11. Email Unsubscribes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_unsubscribes (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(190) NOT NULL UNIQUE,
        unsubscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reason VARCHAR(255) NULL,
        INDEX idx_unsub_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    isInitialized = true;

    console.log('[MySQL DB] Database schema verified and initialized successfully.');
    return true;
  } catch (err) {
    console.warn('[MySQL DB] Failed to auto-initialize MySQL tables:', err);
    return false;
  }
}

/**
 * Read site config from MySQL database
 */
export async function getDbSiteConfig(): Promise<SiteConfig | null> {
  const db = getDbPool();
  if (!db) return null;

  try {
    await initDatabase();
    const [rows]: any = await db.query(
      'SELECT config_json FROM site_config WHERE config_key = ? LIMIT 1',
      ['default_config']
    );

    if (rows && rows.length > 0 && rows[0].config_json) {
      return JSON.parse(rows[0].config_json) as SiteConfig;
    }
  } catch (err) {
    console.warn('[MySQL DB] Error reading config from MySQL:', err);
  }
  return null;
}

/**
 * Save site config to MySQL database
 */
export async function saveDbSiteConfig(config: SiteConfig): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await initDatabase();
    const jsonStr = JSON.stringify(config);
    await db.query(
      `INSERT INTO site_config (config_key, config_json)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE config_json = VALUES(config_json)`,
      ['default_config', jsonStr]
    );
    return true;
  } catch (err) {
    console.warn('[MySQL DB] Error saving config to MySQL:', err);
    return false;
  }
}

/**
 * Log Buy Now button click analytics in MySQL database
 */
export async function recordBuyNowClick(userAgent?: string, ipAddress?: string): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await initDatabase();
    await db.query(
      'INSERT INTO buy_now_analytics (user_agent, ip_address) VALUES (?, ?)',
      [userAgent || null, ipAddress || null]
    );
    return true;
  } catch (err) {
    console.warn('[MySQL DB] Error recording analytics click in MySQL:', err);
    return false;
  }
}

/**
 * Record a visitor landing event (Source, City, Device, UTM)
 */
export async function recordVisitorLog(input: VisitorLogInput): Promise<boolean> {
  const newItem: VisitorLogItem = {
    id: Date.now().toString(),
    ipAddress: input.ipAddress || '127.0.0.1',
    city: input.city || 'Bandung',
    country: input.country || 'Indonesia',
    referrer: input.referrer || 'Direct',
    sourceCategory: input.sourceCategory || 'Direct / Bookmark',
    utmSource: input.utmSource || undefined,
    utmMedium: input.utmMedium || undefined,
    utmCampaign: input.utmCampaign || undefined,

    deviceType: input.deviceType || 'Mobile',
    browser: input.browser || 'Chrome',
    createdAt: new Date().toISOString(),
  };

  // Add to memory store (keeps last 500 items for fallback)
  memoryVisitorLogs.unshift(newItem);
  if (memoryVisitorLogs.length > 500) {
    memoryVisitorLogs.pop();
  }

  const db = getDbPool();
  if (!db) return true;

  try {
    await initDatabase();
    await db.query(
      `INSERT INTO visitor_logs 
       (ip_address, city, country, referrer, source_category, utm_source, utm_medium, utm_campaign, device_type, browser)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newItem.ipAddress,
        newItem.city,
        newItem.country,
        newItem.referrer,
        newItem.sourceCategory,
        newItem.utmSource,
        newItem.utmMedium,
        newItem.utmCampaign,
        newItem.deviceType,
        newItem.browser,
      ]
    );
    return true;
  } catch (err) {
    console.warn('[MySQL DB] Error recording visitor log:', err);
    return false;
  }
}

/**
 * Get aggregated traffic visitor analytics (supports Date Range filter)
 */
export async function getDetailedVisitorAnalytics(startDate?: string, endDate?: string) {
  const db = getDbPool();

  // Parse start/end dates
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();

  let logs: VisitorLogItem[] = [];
  let totalBuyNowClicks = 0;

  if (db) {
    try {
      await initDatabase();

      // Query visitor logs in date range
      const [rows]: any = await db.query(
        `SELECT id, ip_address as ipAddress, city, country, referrer, 
                source_category as sourceCategory, utm_source as utmSource, 
                utm_medium as utmMedium, utm_campaign as utmCampaign, 
                device_type as deviceType, browser, created_at as createdAt
         FROM visitor_logs
         WHERE created_at >= ? AND created_at <= ?
         ORDER BY created_at DESC`,
        [start, end]
      );
      logs = rows || [];

      // Query clicks in date range
      const [clickRows]: any = await db.query(
        `SELECT COUNT(*) as count FROM buy_now_analytics WHERE clicked_at >= ? AND clicked_at <= ?`,
        [start, end]
      );
      totalBuyNowClicks = clickRows[0]?.count || 0;
    } catch (err) {
      console.warn('[MySQL DB] Error fetching analytics from MySQL:', err);
      logs = memoryVisitorLogs;
    }
  } else {
    // Memory fallback
    logs = memoryVisitorLogs.filter((item) => {
      const d = new Date(item.createdAt);
      return d >= start && d <= end;
    });
  }

  // Aggregate Metrics
  const totalPageviews = logs.length;
  const uniqueIPs = new Set(logs.map((l) => l.ipAddress)).size;

  // Aggregate Traffic Sources
  const sourceCounts: Record<string, number> = {};
  logs.forEach((l) => {
    const src = l.sourceCategory || 'Direct / Bookmark';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const trafficSources = Object.entries(sourceCounts)
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalPageviews > 0 ? Math.round((count / totalPageviews) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Aggregate Top Cities
  const cityCounts: Record<string, number> = {};
  logs.forEach((l) => {
    const city = l.city || 'Unknown';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  const topCities = Object.entries(cityCounts)
    .map(([city, count]) => ({
      city,
      count,
      percentage: totalPageviews > 0 ? Math.round((count / totalPageviews) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Aggregate Device Types
  const deviceCounts: Record<string, number> = {};
  logs.forEach((l) => {
    const dev = l.deviceType || 'Mobile';
    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
  });

  return {
    totalPageviews,
    uniqueVisitors: uniqueIPs,
    totalBuyNowClicks,
    conversionRate: totalPageviews > 0 ? ((totalBuyNowClicks / totalPageviews) * 100).toFixed(1) : '0.0',
    trafficSources,
    topCities,
    deviceCounts,
    recentLogs: logs.slice(0, 50),
  };
}

/**
 * Record a new affiliate application
 */
export async function recordAffiliateApplication(input: AffiliateApplicationInput): Promise<AffiliateApplicationItem> {
  const db = getDbPool();
  const newItem: AffiliateApplicationItem = {
    id: Date.now(),
    fullName: input.fullName,
    whatsapp: input.whatsapp,
    email: input.email || '',
    instagramTiktok: input.instagramTiktok || '',
    city: input.city || '',
    experience: input.experience || '',
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  if (db) {
    try {
      await initDatabase();
      const [result]: any = await db.query(
        `INSERT INTO affiliate_applications (full_name, whatsapp, email, instagram_tiktok, city, experience)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          input.fullName,
          input.whatsapp,
          input.email || null,
          input.instagramTiktok || null,
          input.city || null,
          input.experience || null,
        ]
      );
      newItem.id = result.insertId;
    } catch (err) {
      console.warn('[MySQL DB] Failed to insert affiliate application into MySQL:', err);
      memoryAffiliateApplications.unshift(newItem);
    }
  } else {
    memoryAffiliateApplications.unshift(newItem);
  }

  return newItem;
}

/**
 * Get all affiliate applications
 */
export async function getAffiliateApplicationsFromDb(): Promise<AffiliateApplicationItem[]> {
  const db = getDbPool();

  if (db) {
    try {
      await initDatabase();
      const [rows]: any = await db.query(
        `SELECT id, full_name as fullName, whatsapp, email, 
                instagram_tiktok as instagramTiktok, city, experience, 
                created_at as createdAt, status
         FROM affiliate_applications
         ORDER BY created_at DESC`
      );
      return rows || [];
    } catch (err) {
      console.warn('[MySQL DB] Error fetching affiliate applications:', err);
      return memoryAffiliateApplications;
    }
  }

  return memoryAffiliateApplications;
}

/**
 * Delete an affiliate application by ID
 */
export async function deleteAffiliateApplicationFromDb(id: string | number): Promise<boolean> {
  const db = getDbPool();

  if (db) {
    try {
      await initDatabase();
      await db.query(`DELETE FROM affiliate_applications WHERE id = ?`, [id]);
      return true;
    } catch (err) {
      console.warn('[MySQL DB] Error deleting affiliate application:', err);
    }
  }

  const idx = memoryAffiliateApplications.findIndex((item) => String(item.id) === String(id));
  if (idx !== -1) {
    memoryAffiliateApplications.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Record a new Compensation Application
 */
export async function recordCompensationApplication(input: CompensationApplicationInput): Promise<CompensationApplicationItem> {
  const db = getDbPool();
  const newItem: CompensationApplicationItem = {
    id: Date.now(),
    fullName: input.fullName,
    identityNumber: input.identityNumber,
    ktpImageUrl: input.ktpImageUrl,
    whatsapp: input.whatsapp,
    email: input.email,
    ticketProofUrl: input.ticketProofUrl,
    ticketCount: input.ticketCount,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  if (db) {
    try {
      await initDatabase();
      const [result]: any = await db.query(
        `INSERT INTO compensation_applications (full_name, identity_number, ktp_image_url, whatsapp, email, ticket_proof_url, ticket_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          input.fullName,
          input.identityNumber,
          input.ktpImageUrl,
          input.whatsapp,
          input.email,
          input.ticketProofUrl,
          input.ticketCount,
        ]
      );
      newItem.id = result.insertId;
    } catch (err) {
      console.warn('[MySQL DB] Failed to insert compensation application into MySQL:', err);
      memoryCompensationApplications.unshift(newItem);
    }
  } else {
    memoryCompensationApplications.unshift(newItem);
  }

  return newItem;
}

/**
 * Get all compensation applications
 */
export async function getCompensationApplicationsFromDb(): Promise<CompensationApplicationItem[]> {
  const db = getDbPool();

  if (db) {
    try {
      await initDatabase();
      const [rows]: any = await db.query(
        `SELECT id, full_name as fullName, identity_number as identityNumber, 
                ktp_image_url as ktpImageUrl, whatsapp, email, 
                ticket_proof_url as ticketProofUrl, ticket_count as ticketCount,
                created_at as createdAt, status
         FROM compensation_applications
         ORDER BY created_at DESC`
      );
      return rows || [];
    } catch (err) {
      console.warn('[MySQL DB] Error fetching compensation applications:', err);
      return memoryCompensationApplications;
    }
  }

  return memoryCompensationApplications;
}

/**
 * Delete a compensation application by ID
 */
export async function deleteCompensationApplicationFromDb(id: string | number): Promise<boolean> {
  const db = getDbPool();

  if (db) {
    try {
      await initDatabase();
      await db.query(`DELETE FROM compensation_applications WHERE id = ?`, [id]);
      return true;
    } catch (err) {
      console.warn('[MySQL DB] Error deleting compensation application:', err);
    }
  }

  const idx = memoryCompensationApplications.findIndex((item) => String(item.id) === String(id));
  if (idx !== -1) {
    memoryCompensationApplications.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Normalizes phone numbers (strips non-digits, converts 628... or 08... to 8...)
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Bulk import master buyers 2024
 */
export async function importMasterBuyers2024(records: MasterBuyer2024Record[]): Promise<number> {
  const db = getDbPool();
  if (records.length === 0) return 0;

  if (db) {
    try {
      await initDatabase();
      // Prepare bulk values
      const values = records.map((r) => [
        (r.email || '').trim().toLowerCase(),
        normalizePhoneNumber(r.phone),
        (r.name || '').trim(),
        r.qtyTicket || 1,
      ]);

      await db.query(
        `INSERT INTO master_buyers_2024 (email, phone, name, qty_ticket) VALUES ?`,
        [values]
      );
      return records.length;
    } catch (err) {
      console.warn('[MySQL DB] Failed bulk insert master buyers 2024:', err);
    }
  }

  // Memory fallback
  records.forEach((r) => {
    memoryMasterBuyers2024.push({
      email: (r.email || '').trim().toLowerCase(),
      phone: normalizePhoneNumber(r.phone),
      name: (r.name || '').trim(),
      qtyTicket: r.qtyTicket || 1,
    });
  });

  return records.length;
}

/**
 * Get total master buyers 2024 count
 */
export async function getMasterBuyersCount(): Promise<number> {
  const db = getDbPool();
  if (db) {
    try {
      await initDatabase();
      const [rows]: any = await db.query(`SELECT COUNT(*) as cnt FROM master_buyers_2024`);
      return rows[0]?.cnt || 0;
    } catch (err) {
      console.warn('[MySQL DB] Failed get master buyers count:', err);
    }
  }
  return memoryMasterBuyers2024.length;
}

/**
 * Clear all master buyers 2024 records
 */
export async function clearMasterBuyers2024(): Promise<boolean> {
  const db = getDbPool();
  if (db) {
    try {
      await initDatabase();
      await db.query(`TRUNCATE TABLE master_buyers_2024`);
      return true;
    } catch (err) {
      console.warn('[MySQL DB] Failed truncate master_buyers_2024:', err);
    }
  }
  memoryMasterBuyers2024.length = 0;
  return true;
}

/**
 * Evaluate curation status for a compensation claim against Master Buyers 2024
 */
export async function evaluateClaimCuration(claim: CompensationApplicationItem): Promise<CurationEvaluation> {
  const userEmail = (claim.email || '').trim().toLowerCase();
  const userPhone = normalizePhoneNumber(claim.whatsapp);

  // Extract claimed numeric ticket count (e.g. "2 Tiket" -> 2)
  const claimedCountMatch = (claim.ticketCount || '').match(/\d+/);
  const claimedQty = claimedCountMatch ? parseInt(claimedCountMatch[0], 10) : 1;

  let matchedRecords: MasterBuyer2024Record[] = [];
  let matchedByEmail = false;
  let matchedByPhone = false;

  const db = getDbPool();

  if (db) {
    try {
      await initDatabase();
      const [rows]: any = await db.query(
        `SELECT email, phone, name, qty_ticket as qtyTicket
         FROM master_buyers_2024
         WHERE (email = ? AND email != '') OR (phone = ? AND phone != '')`,
        [userEmail, userPhone]
      );
      matchedRecords = rows || [];
    } catch (err) {
      console.warn('[MySQL DB] Failed to query master buyers for curation:', err);
    }
  }

  // Memory fallback if DB unavailable or empty
  if (matchedRecords.length === 0 && memoryMasterBuyers2024.length > 0) {
    matchedRecords = memoryMasterBuyers2024.filter((r) => {
      const matchE = userEmail && r.email === userEmail;
      const matchP = userPhone && r.phone === userPhone;
      return matchE || matchP;
    });
  }

  if (matchedRecords.length === 0) {
    return {
      status: 'UNMATCHED',
      purchasedQty: 0,
      claimedQty,
      matchedBy: 'none',
    };
  }

  let totalPurchased = 0;
  let matchedName = '';

  matchedRecords.forEach((r) => {
    totalPurchased += r.qtyTicket || 1;
    if (!matchedName && r.name) matchedName = r.name;
    if (userEmail && r.email === userEmail) matchedByEmail = true;
    if (userPhone && r.phone === userPhone) matchedByPhone = true;
  });

  let matchedBy: 'email' | 'phone' | 'both' = 'email';
  if (matchedByEmail && matchedByPhone) matchedBy = 'both';
  else if (matchedByPhone) matchedBy = 'phone';

  const isOverclaim = claimedQty > totalPurchased;

  return {
    status: isOverclaim ? 'OVERCLAIM_WARNING' : 'VERIFIED_MATCH',
    purchasedQty: totalPurchased,
    claimedQty,
    matchedBy,
    matchedBuyerName: matchedName,
  };
}

/**
 * Record a new F&B Tenant Application
 */
export async function recordTenantApplication(input: TenantApplicationInput): Promise<TenantApplicationItem> {
  const db = getDbPool();
  const rawCustomData = input.customData || (input.responses ? { responses: input.responses } : {});
  const customDataStr = typeof rawCustomData === 'string' ? rawCustomData : JSON.stringify(rawCustomData);

  const newItem: TenantApplicationItem = {
    id: Date.now(),
    brandName: input.brandName || '',
    category: input.category || '',
    menuDescription: input.menuDescription || '',
    priceRange: input.priceRange || '',
    instagramCatalog: input.instagramCatalog || '',
    picName: input.picName || '',
    whatsapp: input.whatsapp || '',
    email: input.email || '',
    city: input.city || '',
    powerRequirement: input.powerRequirement || '',
    equipmentList: input.equipmentList || '',
    eventExperience: input.eventExperience || '',
    customData: typeof rawCustomData === 'object' ? rawCustomData : {},
    responses: input.responses || [],
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  if (db) {
    try {
      await initDatabase();
      const [result]: any = await db.query(
        `INSERT INTO tenant_applications 
         (brand_name, category, menu_description, price_range, instagram_catalog, pic_name, whatsapp, email, city, power_requirement, equipment_list, event_experience, custom_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newItem.brandName,
          newItem.category,
          newItem.menuDescription || null,
          newItem.priceRange || null,
          newItem.instagramCatalog || null,
          newItem.picName,
          newItem.whatsapp,
          newItem.email || null,
          newItem.city || null,
          newItem.powerRequirement || null,
          newItem.equipmentList || null,
          newItem.eventExperience || null,
          customDataStr,
        ]
      );
      newItem.id = result.insertId;
    } catch (err) {
      console.warn('[MySQL DB] Failed to insert tenant application into MySQL:', err);
      memoryTenantApplications.unshift(newItem);
    }
  } else {
    memoryTenantApplications.unshift(newItem);
  }

  return newItem;
}

/**
 * Get all F&B Tenant applications
 */
export async function getTenantApplicationsFromDb(): Promise<TenantApplicationItem[]> {
  const db = getDbPool();

  if (db) {
    try {
      await initDatabase();
      const [rows]: any = await db.query(
        `SELECT id, brand_name as brandName, category, menu_description as menuDescription, 
                price_range as priceRange, instagram_catalog as instagramCatalog, 
                pic_name as picName, whatsapp, email, city, 
                power_requirement as powerRequirement, equipment_list as equipmentList, 
                event_experience as eventExperience, custom_data as customDataRaw,
                created_at as createdAt, status
         FROM tenant_applications
         ORDER BY created_at DESC`
      );
      return (rows || []).map((row: any) => {
        let customData: Record<string, any> = {};
        let responses: { id: string; label: string; value: any; type?: string }[] = [];
        if (row.customDataRaw) {
          try {
            customData = typeof row.customDataRaw === 'string' ? JSON.parse(row.customDataRaw) : row.customDataRaw;
            if (customData && Array.isArray((customData as any).responses)) {
              responses = (customData as any).responses;
            }
          } catch (e) {}
        }
        return {
          id: row.id,
          brandName: row.brandName || '',
          category: row.category || '',
          menuDescription: row.menuDescription || '',
          priceRange: row.priceRange || '',
          instagramCatalog: row.instagramCatalog || '',
          picName: row.picName || '',
          whatsapp: row.whatsapp || '',
          email: row.email || '',
          city: row.city || '',
          powerRequirement: row.powerRequirement || '',
          equipmentList: row.equipmentList || '',
          eventExperience: row.eventExperience || '',
          customData,
          responses,
          createdAt: row.createdAt,
          status: row.status || 'active',
        };
      });
    } catch (err) {
      console.warn('[MySQL DB] Error fetching tenant applications:', err);
      return memoryTenantApplications;
    }
  }

  return memoryTenantApplications;
}

/**
 * Delete a tenant application by ID
 */
export async function deleteTenantApplicationFromDb(id: string | number): Promise<boolean> {
  const db = getDbPool();

  if (db) {
    try {
      await initDatabase();
      await db.query(`DELETE FROM tenant_applications WHERE id = ?`, [id]);
      return true;
    } catch (err) {
      console.warn('[MySQL DB] Error deleting tenant application:', err);
    }
  }

  const idx = memoryTenantApplications.findIndex((item) => String(item.id) === String(id));
  if (idx !== -1) {
    memoryTenantApplications.splice(idx, 1);
    return true;
  }
  return false;
}

/* ==========================================================================
   EMAIL BLAST QUEUE & SMTP DATABASE HELPERS
   ========================================================================== */

export interface SmtpSettings {
  id?: number;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  updatedAt?: string;
}

export interface EmailCampaignItem {
  id: number;
  title: string;
  subject: string;
  templateHtml: string;
  intervalMinutes: number;
  dailyLimit: number;
  activeHoursStart: number;
  activeHoursEnd: number;
  status: 'draft' | 'running' | 'paused' | 'completed';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  lastSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailQueueItem {
  id: number;
  campaignId: number;
  name: string;
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  scheduledAt: string | null;
  sentAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
}

/**
 * Fetch active SMTP settings
 */
export async function getSmtpSettingsFromDb(): Promise<SmtpSettings | null> {
  const db = getDbPool();
  if (!db) return null;

  try {
    await initDatabase();
    const [rows]: any = await db.query(
      `SELECT id, host, port, secure, user, pass, from_email as fromEmail, from_name as fromName, reply_to as replyTo, updated_at as updatedAt
       FROM email_smtp_settings ORDER BY id DESC LIMIT 1`
    );

    if (rows && rows.length > 0) {
      return {
        id: rows[0].id,
        host: rows[0].host,
        port: Number(rows[0].port),
        secure: Boolean(rows[0].secure),
        user: rows[0].user,
        pass: rows[0].pass,
        fromEmail: rows[0].fromEmail,
        fromName: rows[0].fromName,
        replyTo: rows[0].replyTo || '',
        updatedAt: rows[0].updatedAt,
      };
    }
  } catch (err) {
    console.warn('[MySQL DB] Error fetching SMTP settings:', err);
  }
  return null;
}

/**
 * Save or update SMTP settings
 */
export async function saveSmtpSettingsToDb(settings: SmtpSettings): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await initDatabase();
    const existing = await getSmtpSettingsFromDb();
    if (existing && existing.id) {
      await db.query(
        `UPDATE email_smtp_settings 
         SET host = ?, port = ?, secure = ?, user = ?, pass = ?, from_email = ?, from_name = ?, reply_to = ?
         WHERE id = ?`,
        [
          settings.host.trim(),
          settings.port || 465,
          settings.secure ? 1 : 0,
          settings.user.trim(),
          settings.pass,
          settings.fromEmail.trim(),
          settings.fromName.trim() || 'Playlist Live Festival',
          (settings.replyTo || '').trim(),
          existing.id,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO email_smtp_settings (host, port, secure, user, pass, from_email, from_name, reply_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          settings.host.trim(),
          settings.port || 465,
          settings.secure ? 1 : 0,
          settings.user.trim(),
          settings.pass,
          settings.fromEmail.trim(),
          settings.fromName.trim() || 'Playlist Live Festival',
          (settings.replyTo || '').trim(),
        ]
      );
    }
    return true;
  } catch (err) {
    console.warn('[MySQL DB] Error saving SMTP settings:', err);
    return false;
  }
}

/**
 * Create a new Email Campaign and bulk insert recipients into email_queue
 */
export async function createEmailCampaignWithRecipients(
  campaign: {
    title: string;
    subject: string;
    templateHtml: string;
    intervalMinutes: number;
    dailyLimit: number;
    activeHoursStart: number;
    activeHoursEnd: number;
    status?: 'draft' | 'running' | 'paused';
  },
  recipients: Array<{ name: string; email: string }>
): Promise<{ success: boolean; campaignId?: number; count?: number; error?: string }> {
  const db = getDbPool();
  if (!db) return { success: false, error: 'Database connection unavailable' };

  try {
    await initDatabase();

    // 1. Get unsubscribed emails to filter them out
    const [unsubs]: any = await db.query(`SELECT email FROM email_unsubscribes`);
    const unsubSet = new Set((unsubs || []).map((u: any) => String(u.email).toLowerCase().trim()));

    // 2. Filter & deduplicate valid emails
    const uniqueRecipients: Array<{ name: string; email: string }> = [];
    const seen = new Set<string>();

    for (const r of recipients) {
      const email = String(r.email || '').toLowerCase().trim();
      if (!email || !email.includes('@') || !email.includes('.')) continue;
      if (seen.has(email)) continue;
      if (unsubSet.has(email)) continue;

      seen.add(email);
      uniqueRecipients.push({
        name: (r.name || '').trim(),
        email,
      });
    }

    if (uniqueRecipients.length === 0) {
      return { success: false, error: 'Tidak ada email valid untuk dimasukkan ke antrean.' };
    }

    // 3. Insert campaign
    const [campResult]: any = await db.query(
      `INSERT INTO email_campaigns 
       (title, subject, template_html, interval_minutes, daily_limit, active_hours_start, active_hours_end, status, total_recipients, sent_count, failed_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [
        campaign.title.trim() || 'Email Blast Campaign',
        campaign.subject.trim(),
        campaign.templateHtml,
        campaign.intervalMinutes || 8,
        campaign.dailyLimit || 80,
        campaign.activeHoursStart || 8,
        campaign.activeHoursEnd || 21,
        campaign.status || 'paused',
        uniqueRecipients.length,
      ]
    );

    const campaignId = campResult.insertId;

    // 4. Calculate estimated scheduled_at for each recipient based on interval
    const now = Date.now();
    const intervalMs = (campaign.intervalMinutes || 8) * 60 * 1000;

    // Insert in chunks of 500 to avoid packet size limit
    const chunkSize = 500;
    for (let i = 0; i < uniqueRecipients.length; i += chunkSize) {
      const chunk = uniqueRecipients.slice(i, i + chunkSize);
      const values: any[] = [];
      const placeholders: string[] = [];

      chunk.forEach((rec, idx) => {
        const itemIndex = i + idx;
        const estTime = new Date(now + itemIndex * intervalMs);
        const estSql = estTime.toISOString().slice(0, 19).replace('T', ' ');

        placeholders.push('(?, ?, ?, ?, ?)');
        values.push(campaignId, rec.name, rec.email, 'pending', estSql);
      });

      await db.query(
        `INSERT INTO email_queue (campaign_id, name, email, status, scheduled_at)
         VALUES ${placeholders.join(', ')}`,
        values
      );
    }

    return { success: true, campaignId, count: uniqueRecipients.length };
  } catch (err: any) {
    console.warn('[MySQL DB] Error creating email campaign:', err);
    return { success: false, error: err.message || 'Gagal membuat antrean campaign' };
  }
}

/**
 * Get all email campaigns with latest stats
 */
export async function getEmailCampaignsFromDb(): Promise<EmailCampaignItem[]> {
  const db = getDbPool();
  if (!db) return [];

  try {
    await initDatabase();
    const [rows]: any = await db.query(
      `SELECT id, title, subject, template_html as templateHtml, interval_minutes as intervalMinutes,
              daily_limit as dailyLimit, active_hours_start as activeHoursStart, active_hours_end as activeHoursEnd,
              status, total_recipients as totalRecipients, sent_count as sentCount, failed_count as failedCount,
              last_sent_at as lastSentAt, created_at as createdAt, updated_at as updatedAt
       FROM email_campaigns ORDER BY id DESC`
    );

    return (rows || []).map((r: any) => ({
      ...r,
      intervalMinutes: Number(r.intervalMinutes),
      dailyLimit: Number(r.dailyLimit),
      activeHoursStart: Number(r.activeHoursStart),
      activeHoursEnd: Number(r.activeHoursEnd),
      totalRecipients: Number(r.totalRecipients),
      sentCount: Number(r.sentCount),
      failedCount: Number(r.failedCount),
    }));
  } catch (err) {
    console.warn('[MySQL DB] Error fetching campaigns:', err);
    return [];
  }
}

/**
 * Update campaign status (running, paused, completed)
 */
export async function updateEmailCampaignStatus(
  campaignId: number,
  status: 'running' | 'paused' | 'completed'
): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await initDatabase();
    await db.query(`UPDATE email_campaigns SET status = ? WHERE id = ?`, [status, campaignId]);
    return true;
  } catch (err) {
    console.warn('[MySQL DB] Error updating campaign status:', err);
    return false;
  }
}

/**
 * Get Queue items for a campaign with pagination, search, and status filter
 */
export async function getEmailQueueFromDb(params: {
  campaignId?: number;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: EmailQueueItem[]; total: number; sentToday: number }> {
  const db = getDbPool();
  if (!db) return { items: [], total: 0, sentToday: 0 };

  try {
    await initDatabase();
    const { campaignId, status, search, page = 1, limit = 50 } = params;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];

    if (campaignId) {
      conditions.push(`campaign_id = ?`);
      values.push(campaignId);
    }

    if (status && status !== 'all') {
      conditions.push(`status = ?`);
      values.push(status);
    }

    if (search && search.trim()) {
      conditions.push(`(name LIKE ? OR email LIKE ?)`);
      values.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const [countRows]: any = await db.query(
      `SELECT COUNT(*) as cnt FROM email_queue ${whereClause}`,
      values
    );
    const total = countRows[0]?.cnt || 0;

    // Count sent today
    const [todayRows]: any = await db.query(
      `SELECT COUNT(*) as todayCount FROM email_queue WHERE status = 'sent' AND DATE(sent_at) = CURDATE()`
    );
    const sentToday = todayRows[0]?.todayCount || 0;

    // Items query
    const [rows]: any = await db.query(
      `SELECT id, campaign_id as campaignId, name, email, status, scheduled_at as scheduledAt,
              sent_at as sentAt, error_message as errorMessage, retry_count as retryCount, created_at as createdAt
       FROM email_queue
       ${whereClause}
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return { items: rows || [], total, sentToday };
  } catch (err) {
    console.warn('[MySQL DB] Error fetching email queue:', err);
    return { items: [], total: 0, sentToday: 0 };
  }
}

/**
 * Worker helper: Pick the next pending email from a running campaign
 */
export async function getNextPendingEmailForWorker(): Promise<{
  queueItem: EmailQueueItem | null;
  campaign: EmailCampaignItem | null;
  reason?: string;
}> {
  const db = getDbPool();
  if (!db) return { queueItem: null, campaign: null, reason: 'Database not connected' };

  try {
    await initDatabase();

    // 1. Find an active running campaign
    const [campaigns]: any = await db.query(
      `SELECT id, title, subject, template_html as templateHtml, interval_minutes as intervalMinutes,
              daily_limit as dailyLimit, active_hours_start as activeHoursStart, active_hours_end as activeHoursEnd,
              status, total_recipients as totalRecipients, sent_count as sentCount, failed_count as failedCount,
              last_sent_at as lastSentAt, created_at as createdAt, updated_at as updatedAt
       FROM email_campaigns 
       WHERE status = 'running' 
       ORDER BY id ASC 
       LIMIT 1`
    );

    if (!campaigns || campaigns.length === 0) {
      return { queueItem: null, campaign: null, reason: 'Tidak ada campaign yang sedang berjalan (status: running)' };
    }

    const campaign = campaigns[0] as EmailCampaignItem;

    // 2. Check active hours (e.g. 08:00 - 21:00 WIB)
    const currentHour = new Date().getHours();
    if (currentHour < campaign.activeHoursStart || currentHour >= campaign.activeHoursEnd) {
      return {
        queueItem: null,
        campaign,
        reason: `Di luar jam aktif pengiriman (${campaign.activeHoursStart}:00 - ${campaign.activeHoursEnd}:00). Jam sekarang: ${currentHour}:00`,
      };
    }

    // 3. Check daily limit
    const [dailySentRows]: any = await db.query(
      `SELECT COUNT(*) as todayCount FROM email_queue WHERE campaign_id = ? AND status = 'sent' AND DATE(sent_at) = CURDATE()`,
      [campaign.id]
    );
    const todaySent = dailySentRows[0]?.todayCount || 0;
    if (todaySent >= campaign.dailyLimit) {
      return {
        queueItem: null,
        campaign,
        reason: `Batas harian ${campaign.dailyLimit} email sudah tercapai hari ini (${todaySent} terkirim). Akan dilanjutkan besok pagi.`,
      };
    }

    // 4. Check interval cooldown since last sent email (with random jitter ± 30s)
    if (campaign.lastSentAt) {
      const lastSentTime = new Date(campaign.lastSentAt).getTime();
      const elapsedMinutes = (Date.now() - lastSentTime) / (60 * 1000);
      const minInterval = Math.max(1, campaign.intervalMinutes - 0.5); // 30s variance allowance
      if (elapsedMinutes < minInterval) {
        const remainingMinutes = (campaign.intervalMinutes - elapsedMinutes).toFixed(1);
        return {
          queueItem: null,
          campaign,
          reason: `Masih dalam masa jeda aman interval. Sisa waktu: ~${remainingMinutes} menit.`,
        };
      }
    }

    // 5. Select 1 pending item and lock it by setting status to 'sending'
    const [pendingRows]: any = await db.query(
      `SELECT id, campaign_id as campaignId, name, email, status, scheduled_at as scheduledAt,
              sent_at as sentAt, error_message as errorMessage, retry_count as retryCount, created_at as createdAt
       FROM email_queue
       WHERE campaign_id = ? AND status = 'pending'
       ORDER BY id ASC
       LIMIT 1`,
      [campaign.id]
    );

    if (!pendingRows || pendingRows.length === 0) {
      // Mark campaign completed
      await updateEmailCampaignStatus(campaign.id, 'completed');
      return { queueItem: null, campaign, reason: 'Semua email dalam antrean campaign ini telah selesai diproses.' };
    }

    const item = pendingRows[0] as EmailQueueItem;

    // Temporarily mark as sending
    await db.query(`UPDATE email_queue SET status = 'sending' WHERE id = ?`, [item.id]);

    return { queueItem: item, campaign };
  } catch (err: any) {
    console.warn('[MySQL DB] Error picking next queue item:', err);
    return { queueItem: null, campaign: null, reason: err.message };
  }
}

/**
 * Mark queue item as sent & update campaign counter
 */
export async function markEmailQueueSent(id: number, campaignId: number): Promise<void> {
  const db = getDbPool();
  if (!db) return;

  try {
    const nowSql = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      `UPDATE email_queue SET status = 'sent', sent_at = ?, error_message = NULL WHERE id = ?`,
      [nowSql, id]
    );
    await db.query(
      `UPDATE email_campaigns 
       SET sent_count = sent_count + 1, last_sent_at = ? 
       WHERE id = ?`,
      [nowSql, campaignId]
    );
  } catch (err) {
    console.warn('[MySQL DB] Error marking email as sent:', err);
  }
}

/**
 * Mark queue item as failed & update campaign counter
 */
export async function markEmailQueueFailed(id: number, campaignId: number, errorMessage: string): Promise<void> {
  const db = getDbPool();
  if (!db) return;

  try {
    await db.query(
      `UPDATE email_queue SET status = 'failed', error_message = ?, retry_count = retry_count + 1 WHERE id = ?`,
      [errorMessage.slice(0, 500), id]
    );
    await db.query(
      `UPDATE email_campaigns SET failed_count = failed_count + 1 WHERE id = ?`,
      [campaignId]
    );
  } catch (err) {
    console.warn('[MySQL DB] Error marking email as failed:', err);
  }
}

/**
 * Delete a campaign and its queue items
 */
export async function deleteEmailCampaign(campaignId: number): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await initDatabase();
    await db.query(`DELETE FROM email_queue WHERE campaign_id = ?`, [campaignId]);
    await db.query(`DELETE FROM email_campaigns WHERE id = ?`, [campaignId]);
    return true;
  } catch (err) {
    console.warn('[MySQL DB] Error deleting campaign:', err);
    return false;
  }
}

/**
 * Add an unsubscribe record
 */
export async function addEmailUnsubscribe(email: string, reason?: string): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await initDatabase();
    const cleanEmail = email.toLowerCase().trim();
    await db.query(
      `INSERT INTO email_unsubscribes (email, reason) VALUES (?, ?) ON DUPLICATE KEY UPDATE reason = VALUES(reason)`,
      [cleanEmail, reason || 'User requested unsubscribe']
    );
    // Also remove from any pending queue
    await db.query(`DELETE FROM email_queue WHERE email = ? AND status = 'pending'`, [cleanEmail]);
    return true;
  } catch (err) {
    console.warn('[MySQL DB] Error adding unsubscribe:', err);
    return false;
  }
}

/**
 * Reset failed emails in a campaign back to pending
 */
export async function resetFailedQueueItems(campaignId: number): Promise<number> {
  const db = getDbPool();
  if (!db) return 0;

  try {
    await initDatabase();
    const [result]: any = await db.query(
      `UPDATE email_queue SET status = 'pending', error_message = NULL WHERE campaign_id = ? AND status = 'failed'`,
      [campaignId]
    );
    return result?.affectedRows || 0;
  } catch (err) {
    console.warn('[MySQL DB] Error resetting failed items:', err);
    return 0;
  }
}


