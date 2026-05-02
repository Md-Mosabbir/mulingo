export const getUserPreferredLanguageIdSql = `
SELECT preferred_language_id
FROM users
WHERE user_id = ?
LIMIT 1
`;

export const getMessagesPageSql = `
SELECT
  m.message_id,
  m.chat_id,
  m.sender_id,
  u.username AS sender_username,
  u.profile_picture AS sender_avatar,
  m.source_language_id,
  m.message_type,
  m.original_text,
  m.sent_at,
  mt.translated_text
FROM messages m
JOIN users u ON u.user_id = m.sender_id
LEFT JOIN message_translations mt
  ON mt.message_id = m.message_id
 AND mt.target_language_id = ?
WHERE m.chat_id = ?
  AND m.is_deleted = false
  AND (? IS NULL OR m.message_id < ?)
ORDER BY m.message_id DESC
LIMIT ?
`;

export const insertMessageTranslationSql = `
INSERT INTO message_translations (message_id, target_language_id, translated_text)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE translated_text = VALUES(translated_text)
`;

