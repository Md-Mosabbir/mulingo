export const getLanguageCodeByIdSql = `
SELECT language_code
FROM languages
WHERE language_id = ?
LIMIT 1
`;

