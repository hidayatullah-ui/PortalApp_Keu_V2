-- Database setup for Sulthan Group Portal
-- Run this SQL to create the required table

CREATE DATABASE IF NOT EXISTS sult_portal_db;
USE sult_portal_db;

-- Create the key-value store table for the application
CREATE TABLE IF NOT EXISTS kv_store (
    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
    `value` LONGTEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (`key`),
    INDEX idx_updated_at (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user for the application (adjust credentials as needed)
CREATE USER IF NOT EXISTS 'sult_portal_user'@'localhost' IDENTIFIED BY '#Kopi9976';
GRANT ALL PRIVILEGES ON sult_portal_db.* TO 'sult_portal_user'@'localhost';
FLUSH PRIVILEGES;

-- Optional: Insert some initial data if needed
-- INSERT INTO kv_store (`key`, `value`) VALUES 
-- ('sulthan-group-users', '[]'),
-- ('sulthan-group-certificates', '[]'),
-- ('sulthan-group-marketing-names', '[]');
