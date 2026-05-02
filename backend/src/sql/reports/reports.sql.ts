// Rubric-focused SQL queries (DISTINCT, GROUP BY/HAVING, aggregates, subqueries, VIEW usage)

export const distinctSendersInChatSql = `
SELECT DISTINCT sender_id
FROM messages
WHERE chat_id = ?
ORDER BY sender_id ASC
`;

export const chatsForUserUsingInSubquerySql = `
SELECT
  c.chat_id,
  c.chat_type,
  c.chat_name,
  c.updated_at
FROM chats c
WHERE c.chat_id IN (
  SELECT chat_id
  FROM chat_members
  WHERE user_id = ?
)
ORDER BY c.updated_at DESC
LIMIT ?
`;

export const chatAggregateStatsSql = `
SELECT
  m.chat_id,
  COUNT(*) AS total_messages,
  MIN(m.sent_at) AS first_message_at,
  MAX(m.sent_at) AS last_message_at,
  AVG(CHAR_LENGTH(m.original_text)) AS avg_text_length,
  SUM(CHAR_LENGTH(m.original_text)) AS total_text_characters
FROM messages m
WHERE m.chat_id = ?
  AND m.is_deleted = false
  AND m.message_type = 'text'
GROUP BY m.chat_id
HAVING COUNT(*) >= ?
`;

export const userChatOverviewViewSql = `
SELECT *
FROM v_user_chat_overview
WHERE user_id = ?
ORDER BY last_message_at DESC
LIMIT ?
`;

