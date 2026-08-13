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


