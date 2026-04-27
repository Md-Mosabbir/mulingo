export const authSql = {
  getUserByGoogleId: 'SELECT * FROM users WHERE google_id = ?',
  createNewUser: 'INSERT INTO users (google_id, username, email, first_name, last_name, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',

}