export const createGroupChatSql = `
INSERT INTO chats (chat_type, chat_name, chat_image, created_by)
VALUES ('group', ?, ?, ?)
`;

export const updateGroupChatSql = `
UPDATE chats
SET
  chat_name = COALESCE(?, chat_name),
  chat_image = COALESCE(?, chat_image)
WHERE chat_id = ? AND chat_type = 'group'
`;

export const getGroupDetailsSql = `
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
  AND c.chat_type = 'group'
LIMIT 1
`;

export const listMyGroupsSql = `
SELECT
  c.chat_id,
  c.chat_name,
  c.chat_image,
  c.updated_at,
  c.created_at
FROM chats c
JOIN chat_members me ON me.chat_id = c.chat_id AND me.user_id = ?
WHERE c.chat_type = 'group'
ORDER BY c.updated_at DESC
`;

export const getGroupMembersSql = `
SELECT
  u.user_id,
  u.username,
  u.first_name,
  u.last_name,
  u.profile_picture,
  u.preferred_language_id,
  cm.member_role,
  cm.joined_at,
  cm.is_muted,
  cm.last_read_message_id
FROM chat_members cm
JOIN users u ON u.user_id = cm.user_id
WHERE cm.chat_id = ?
ORDER BY
  CASE cm.member_role
    WHEN 'owner' THEN 0
    WHEN 'admin' THEN 1
    ELSE 2
  END,
  cm.joined_at ASC
`;

export const getMyMembershipSql = `
SELECT member_role, is_muted
FROM chat_members
WHERE chat_id = ? AND user_id = ?
LIMIT 1
`;

export const addGroupMemberSql = `
INSERT INTO chat_members (chat_id, user_id, member_role)
VALUES (?, ?, 'member')
`;

export const removeGroupMemberSql = `
DELETE FROM chat_members
WHERE chat_id = ? AND user_id = ?
`;

export const updateMemberRoleSql = `
UPDATE chat_members
SET member_role = ?
WHERE chat_id = ? AND user_id = ?
`;

export const setMemberMutedSql = `
UPDATE chat_members
SET is_muted = ?
WHERE chat_id = ? AND user_id = ?
`;

