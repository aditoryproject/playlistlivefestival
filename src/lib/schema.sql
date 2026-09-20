-- MySQL Database Schema for Playlist Rewind Website
-- Author: Antigravity AI
-- Date: 2026

CREATE DATABASE IF NOT EXISTS `playlistweb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `playlistweb`;

-- Table 1: Site Configuration Storage
CREATE TABLE IF NOT EXISTS `site_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(50) NOT NULL UNIQUE DEFAULT 'default_config',
  `config_json` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: Buy Now Click Analytics Counter
CREATE TABLE IF NOT EXISTS `buy_now_analytics` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `clicked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `user_agent` VARCHAR(255) NULL,
  `ip_address` VARCHAR(45) NULL,
  INDEX `idx_clicked_at` (`clicked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: Detailed Visitor Traffic Analytics
CREATE TABLE IF NOT EXISTS `visitor_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `ip_address` VARCHAR(45) NULL,
  `city` VARCHAR(100) DEFAULT 'Unknown',
  `country` VARCHAR(100) DEFAULT 'Indonesia',
  `referrer` VARCHAR(255) DEFAULT 'Direct',
  `source_category` VARCHAR(50) DEFAULT 'Direct / Bookmark',
  `utm_source` VARCHAR(100) NULL,
  `utm_medium` VARCHAR(100) NULL,
  `utm_campaign` VARCHAR(100) NULL,
  `device_type` VARCHAR(50) DEFAULT 'Mobile',
  `browser` VARCHAR(50) DEFAULT 'Chrome',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_source` (`source_category`),
  INDEX `idx_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: Affiliate Registrations / Submissions
CREATE TABLE IF NOT EXISTS `affiliate_applications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `whatsapp` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) NULL,
  `instagram_tiktok` VARCHAR(150) NULL,
  `city` VARCHAR(100) NULL,
  `experience` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(20) DEFAULT 'active',
  INDEX `idx_affiliate_created` (`created_at`),
  INDEX `idx_affiliate_whatsapp` (`whatsapp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 5: Tenant F&B Registrations / Submissions
CREATE TABLE IF NOT EXISTS `tenant_applications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `brand_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `menu_description` TEXT NULL,
  `price_range` VARCHAR(100) NULL,
  `instagram_catalog` VARCHAR(255) NULL,
  `pic_name` VARCHAR(150) NOT NULL,
  `whatsapp` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) NULL,
  `city` VARCHAR(100) NULL,
  `power_requirement` VARCHAR(50) NULL,
  `equipment_list` TEXT NULL,
  `event_experience` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(20) DEFAULT 'active',
  INDEX `idx_tenant_created` (`created_at`),
  INDEX `idx_tenant_whatsapp` (`whatsapp`),
  INDEX `idx_tenant_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 6: Email SMTP Configuration
CREATE TABLE IF NOT EXISTS `email_smtp_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `host` VARCHAR(255) NOT NULL,
  `port` INT NOT NULL DEFAULT 465,
  `secure` TINYINT(1) NOT NULL DEFAULT 1,
  `user` VARCHAR(255) NOT NULL,
  `pass` VARCHAR(255) NOT NULL,
  `from_email` VARCHAR(255) NOT NULL,
  `from_name` VARCHAR(255) NOT NULL DEFAULT 'Playlist Live Festival',
  `reply_to` VARCHAR(255) NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 7: Email Blast Campaigns
CREATE TABLE IF NOT EXISTS `email_campaigns` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `template_html` LONGTEXT NOT NULL,
  `interval_minutes` INT NOT NULL DEFAULT 8,
  `daily_limit` INT NOT NULL DEFAULT 80,
  `active_hours_start` INT NOT NULL DEFAULT 8,
  `active_hours_end` INT NOT NULL DEFAULT 21,
  `status` VARCHAR(30) NOT NULL DEFAULT 'paused', -- 'draft', 'running', 'paused', 'completed'
  `total_recipients` INT NOT NULL DEFAULT 0,
  `sent_count` INT NOT NULL DEFAULT 0,
  `failed_count` INT NOT NULL DEFAULT 0,
  `last_sent_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_campaign_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 8: Email Queue Items
CREATE TABLE IF NOT EXISTS `email_queue` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `campaign_id` BIGINT NOT NULL,
  `name` VARCHAR(150) NULL,
  `email` VARCHAR(190) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'sending', 'sent', 'failed'
  `scheduled_at` DATETIME NULL,
  `sent_at` DATETIME NULL,
  `error_message` TEXT NULL,
  `retry_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_queue_campaign` (`campaign_id`),
  INDEX `idx_queue_status` (`status`),
  INDEX `idx_queue_scheduled` (`scheduled_at`),
  INDEX `idx_queue_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 9: Email Unsubscribes List
CREATE TABLE IF NOT EXISTS `email_unsubscribes` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `unsubscribed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `reason` VARCHAR(255) NULL,
  INDEX `idx_unsub_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


