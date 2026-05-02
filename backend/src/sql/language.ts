import pool from '../config/db';
import { getLanguageCodeByIdSql } from './language.sql';

export async function getLanguageCodeById(languageId: number): Promise<string | null> {
  const [rows]: any = await pool.query(getLanguageCodeByIdSql, [languageId]);
  return rows[0]?.language_code ?? null;
}

