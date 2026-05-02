import pool from '../../config/db';
import {
  getLanguageIdByCodeSql,
  getUserByIdSql,
  listUsersSql,
  updateUserProfileSql,
} from './profile.sql';

export type DbUserProfile = {
  user_id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_picture: string | null;
  preferred_language_id: number;
  preferred_language_code: string | null;
  preferred_language_name: string | null;
  account_status: 'active' | 'inactive' | 'banned';
  last_seen: string;
  created_at: string;
  updated_at: string;
};

export async function getUserById(userId: number): Promise<DbUserProfile | null> {
  const [rows]: any = await pool.query(getUserByIdSql, [userId]);
  return rows[0] || null;
}

export async function listUsers(
  myUserId: number,
  query: string,
  limit: number,
): Promise<any[]> {
  const term = `%${query}%`;
  const safeLimit = Math.max(1, Math.min(100, limit));
  const [rows]: any = await pool.query(listUsersSql, [myUserId, term, term, term, safeLimit]);
  return rows;
}

export async function getLanguageIdByCode(code: string): Promise<number | null> {
  const [rows]: any = await pool.query(getLanguageIdByCodeSql, [code]);
  return rows[0]?.language_id ?? null;
}

export async function updateUserProfile(args: {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  preferredLanguageId?: number | null;
}): Promise<void> {
  const { userId, firstName, lastName, profilePicture, preferredLanguageId } = args;
  await pool.query(updateUserProfileSql, [
    firstName ?? null,
    lastName ?? null,
    profilePicture ?? null,
    preferredLanguageId ?? null,
    userId,
  ]);
}

