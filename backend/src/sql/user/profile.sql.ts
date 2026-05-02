export const getUserByIdSql = `
SELECT
  u.user_id,
  u.username,
  u.email,
  u.first_name,
  u.last_name,
  u.profile_picture,
  u.preferred_language_id,
  l.language_code AS preferred_language_code,
  l.language_name AS preferred_language_name,
  u.account_status,
  u.last_seen,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN languages l ON l.language_id = u.preferred_language_id
WHERE u.user_id = ?
LIMIT 1
`;

export const listUsersSql = `
SELECT
  u.user_id,
  u.username,
  u.first_name,
  u.last_name,
  u.profile_picture,
  u.preferred_language_id,
  l.language_code AS preferred_language_code
FROM users u
LEFT JOIN languages l ON l.language_id = u.preferred_language_id
WHERE u.user_id != ?
  AND (
    u.username LIKE ?
    OR u.first_name LIKE ?
    OR u.last_name LIKE ?
  )
ORDER BY u.username ASC
LIMIT ?
`;

export const updateUserProfileSql = `
UPDATE users
SET
  first_name = COALESCE(?, first_name),
  last_name = COALESCE(?, last_name),
  profile_picture = COALESCE(?, profile_picture),
  preferred_language_id = COALESCE(?, preferred_language_id)
WHERE user_id = ?
`;

export const getLanguageIdByCodeSql = `
SELECT language_id
FROM languages
WHERE language_code = ?
LIMIT 1
`;

