-- CSE311 Submission Extras (Rubric Coverage)
-- This file is intentionally separate from src/config/schema.sql so core tables remain unchanged.

-- =========================================================
-- 1) VIEW CREATION (Rubric: "Create at least one VIEW")
-- =========================================================
-- Overview per user per chat: members + message aggregates + last message.
CREATE OR REPLACE VIEW v_user_chat_overview AS
SELECT
  cm.user_id,
  c.chat_id,
  c.chat_type,
  c.chat_name,
  c.chat_status,
  COUNT(DISTINCT cm2.user_id) AS member_count,
  COUNT(m.message_id) AS message_count,
  MIN(m.sent_at) AS first_message_at,
  MAX(m.sent_at) AS last_message_at
FROM chat_members cm
JOIN chats c ON c.chat_id = cm.chat_id
JOIN chat_members cm2 ON cm2.chat_id = c.chat_id
LEFT JOIN messages m ON m.chat_id = c.chat_id AND m.is_deleted = false
GROUP BY
  cm.user_id,
  c.chat_id,
  c.chat_type,
  c.chat_name,
  c.chat_status;

-- =========================================================
-- 2) USER + PRIVILEGE CREATION (Rubric deliverable)
-- =========================================================
-- NOTE: Adjust host and password as needed.
-- CREATE USER IF NOT EXISTS 'mulingo_app'@'%' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON mulingo.* TO 'mulingo_app'@'%';
-- FLUSH PRIVILEGES;

-- =========================================================
-- 3) Rubric Query Feature Examples (for report appendix)
-- =========================================================

-- DISTINCT example
-- List unique senders inside a chat
-- SELECT DISTINCT sender_id FROM messages WHERE chat_id = 1;

-- Aggregates + GROUP BY + HAVING example
-- Chats with more than 10 messages
-- SELECT chat_id, COUNT(*) AS total_messages
-- FROM messages
-- GROUP BY chat_id
-- HAVING COUNT(*) > 10;

-- MIN/MAX/AVG/SUM example
-- Message text length stats per chat
-- SELECT
--   chat_id,
--   MIN(CHAR_LENGTH(original_text)) AS min_len,
--   MAX(CHAR_LENGTH(original_text)) AS max_len,
--   AVG(CHAR_LENGTH(original_text)) AS avg_len,
--   SUM(CHAR_LENGTH(original_text)) AS total_chars
-- FROM messages
-- WHERE message_type = 'text'
-- GROUP BY chat_id;

-- Multi-row subquery with IN example
-- List chats a user belongs to
-- SELECT c.chat_id, c.chat_name
-- FROM chats c
-- WHERE c.chat_id IN (SELECT chat_id FROM chat_members WHERE user_id = 1);

