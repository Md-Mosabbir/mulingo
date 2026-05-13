-- 1. DATABASE INITIALIZATION
CREATE DATABASE IF NOT EXISTS mulingo;
USE mulingo;

-- 2. CLEANUP (Ensures a fresh start every time you run this)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS message_read_status, message_attachments, message_translations, messages, chat_members, chats, users, languages;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. TABLES

-- Stores all supported languages for the application
CREATE TABLE `languages` (
  `language_id` int PRIMARY KEY AUTO_INCREMENT,
  `language_code` varchar(10) UNIQUE NOT NULL, -- e.g., 'en', 'es', 'ar'
  `language_name` varchar(100) NOT NULL,
  `native_name` varchar(100),
  `direction` ENUM('LTR', 'RTL') DEFAULT 'LTR'
);

-- Stores users with Google Auth IDs and their UI language preference
CREATE TABLE `users` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `google_id` varchar(255) UNIQUE,
  `username` varchar(100) UNIQUE NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `first_name` varchar(100),
  `last_name` varchar(100),
  `profile_picture` varchar(500),
  `preferred_language_id` int NOT NULL DEFAULT 1, -- Defaulting to English (ID 1)
  `account_status` ENUM ('active', 'inactive', 'banned') DEFAULT 'active',
  `last_seen` datetime DEFAULT (CURRENT_TIMESTAMP),
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`preferred_language_id`) REFERENCES `languages` (`language_id`)
);

-- Stores chat sessions (Direct Messages or Groups)
CREATE TABLE `chats` (
  `chat_id` int PRIMARY KEY AUTO_INCREMENT,
  `chat_type` ENUM ('private', 'group') NOT NULL,
  `chat_name` varchar(150), -- Can be NULL for private chats
  `chat_image` varchar(500),
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
  `chat_status` ENUM ('active', 'archived') DEFAULT 'active',
  FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- Junction table connecting users to chats
CREATE TABLE `chat_members` (
  `chat_member_id` int PRIMARY KEY AUTO_INCREMENT,
  `chat_id` int NOT NULL,
  `user_id` int NOT NULL,
  `member_role` ENUM ('owner', 'admin', 'member') DEFAULT 'member',
  `joined_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `is_muted` boolean DEFAULT false,
  `last_read_message_id` int DEFAULT 0, -- Tracks unread messages efficiently
  UNIQUE KEY `unique_membership` (`chat_id`, `user_id`),
  FOREIGN KEY (`chat_id`) REFERENCES `chats` (`chat_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- Stores the source (original) messages
CREATE TABLE `messages` (
  `message_id` int PRIMARY KEY AUTO_INCREMENT,
  `chat_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `source_language_id` int NOT NULL, -- The language the sender actually typed in
  `message_type` ENUM ('text', 'image', 'file', 'audio', 'video') DEFAULT 'text',
  `original_text` text,
  `sent_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `is_deleted` boolean DEFAULT false,
  FOREIGN KEY (`chat_id`) REFERENCES `chats` (`chat_id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`source_language_id`) REFERENCES `languages` (`language_id`)
);

-- Stores the instant translations for each message
CREATE TABLE `message_translations` (
  `translation_id` int PRIMARY KEY AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `target_language_id` int NOT NULL,
  `translated_text` text NOT NULL,
  `translated_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE KEY `unique_translation` (`message_id`, `target_language_id`),
  FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`target_language_id`) REFERENCES `languages` (`language_id`)
);

-- Stores file attachments (images, PDFs, etc.)
CREATE TABLE `message_attachments` (
  `attachment_id` int PRIMARY KEY AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_type` varchar(100),
  `file_size` int,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`message_id`) REFERENCES `messages`(`message_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `push_subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `subscription_json` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. SEED DATA (The "Wink Wink" part)
INSERT INTO languages (language_code, language_name, native_name, direction) VALUES 
('en', 'English', 'English', 'LTR'),
('es', 'Spanish', 'Español', 'LTR'),
('fr', 'French', 'Français', 'LTR'),
('de', 'German', 'Deutsch', 'LTR'),
('it', 'Italian', 'Italiano', 'LTR'),
('pt', 'Portuguese', 'Português', 'LTR'),
('ar', 'Arabic', 'العربية', 'RTL'),
('zh', 'Chinese', '中文', 'LTR'),
('ja', 'Japanese', '日本語', 'LTR'),
('ko', 'Korean', '한국어', 'LTR'),
('hi', 'Hindi', 'हिन्दी', 'LTR');