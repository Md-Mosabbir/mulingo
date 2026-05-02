export const findExistingPrivateChatSql = `
SELECT c.chat_id
FROM chats c
JOIN chat_members cm1 ON c.chat_id = cm1.chat_id
JOIN chat_members cm2 ON c.chat_id = cm2.chat_id
WHERE c.chat_type = 'private'
  AND cm1.user_id = ?
  AND cm2.user_id = ?
LIMIT 1
`;

export const createPrivateChatSql = `
INSERT INTO chats (chat_type, created_by)
VALUES ('private', ?)
`;

export const addChatMemberSql = `
INSERT INTO chat_members (chat_id, user_id, member_role)
VALUES (?, ?, ?)
`;

export const getRoomDetailsSql = `
SELECT
  c.chat_id,
  c.chat_type,
  c.chat_name,
  c.chat_image,
  c.created_by,
  c.created_at,
  c.updated_at,
  c.chat_status
FROM chats c
WHERE c.chat_id = ?
  AND c.chat_type = 'private'
LIMIT 1
`;

export const getChatParticipantsSql = `
SELECT
  u.user_id,
  u.username,
  u.first_name,
  u.last_name,
  u.profile_picture,
  cm.member_role,
  cm.joined_at,
  cm.is_muted,
  cm.last_read_message_id,
  u.preferred_language_id
FROM chat_members cm
JOIN users u ON u.user_id = cm.user_id
WHERE cm.chat_id = ?
ORDER BY cm.joined_at ASC
`;

export const assertUserInChatSql = `
SELECT chat_member_id
FROM chat_members
WHERE chat_id = ? AND user_id = ?
LIMIT 1
`;

export const listMyPrivateRoomsSql = `
SELECT
  c.chat_id,
  c.chat_type,
  c.chat_name,
  c.chat_image,
  c.updated_at,
  c.created_at,
  (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.chat_id = c.chat_id
  ) AS message_count
FROM chats c
JOIN chat_members me ON me.chat_id = c.chat_id AND me.user_id = ?
WHERE c.chat_type = 'private'
ORDER BY c.updated_at DESC
`;

