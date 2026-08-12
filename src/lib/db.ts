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

// In-Memory Fallback Store for Local Dev without MySQL
const memoryVisitorLogs: VisitorLogItem[] = [];
const memoryAffiliateApplications: AffiliateApplicationItem[] = [];


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
        connectionLimit: 10,
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
    utmSource: input.utmSource || null,
    utmMedium: input.utmMedium || null,
    utmCampaign: input.utmCampaign || null,
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

