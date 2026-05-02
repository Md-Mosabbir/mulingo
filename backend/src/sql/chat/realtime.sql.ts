export const getChatMembersForRealtimeSql = `
SELECT
  cm.user_id,
  cm.is_muted,
  cm.member_role,
  u.preferred_language_id
FROM chat_members cm
JOIN users u ON u.user_id = cm.user_id
WHERE cm.chat_id = ?
`;

export const getMyChatMembershipSql = `
SELECT chat_member_id, is_muted, member_role
FROM chat_members
WHERE chat_id = ? AND user_id = ?
LIMIT 1
`;

export const insertMessageSql = `
INSERT INTO messages (chat_id, sender_id, source_language_id, message_type, original_text)
VALUES (?, ?, ?, 'text', ?)
`;

export const updateLastReadMessageSql = `
UPDATE chat_members
SET last_read_message_id = GREATEST(last_read_message_id, ?)
WHERE chat_id = ? AND user_id = ?
`;

