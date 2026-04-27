import pool from '../config/db';

export interface User {
  user_id?: number;
  google_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  preferred_language_id?: number;
}

export const getUserByGoogleId = async (googleId: string): Promise<User | null> => {
  const [rows]: any = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
  return rows[0] || null;
};

export const createNewUser = async (user: User): Promise<number> => {
  const { google_id, username, email, first_name, last_name, profile_picture } = user;
  const [result]: any = await pool.query(
    'INSERT INTO users (google_id, username, email, first_name, last_name, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
    [google_id, username, email, first_name, last_name, profile_picture]
  );
  return result.insertId;
};


