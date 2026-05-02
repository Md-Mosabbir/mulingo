import pool from '../../config/db';
import {
  getMessagesPageSql,
  getUserPreferredLanguageIdSql,
  insertMessageTranslationSql,
} from './messages.sql';

export async function getUserPreferredLanguageId(userId: number): Promise<number | null> {
  const [rows]: any = await pool.query(getUserPreferredLanguageIdSql, [userId]);
  return rows[0]?.preferred_language_id ?? null;
}

export async function getMessagesPage(args: {
  chatId: number;
  targetLanguageId: number;
  cursorMessageId?: number | null;
  limit: number;
}) {
  const safeLimit = Math.max(1, Math.min(100, args.limit));
  const cursor = args.cursorMessageId ?? null;
  const [rows]: any = await pool.query(getMessagesPageSql, [
    args.targetLanguageId,
    args.chatId,
    cursor,
    cursor,
    safeLimit,
  ]);
  return rows;
}

export async function upsertMessageTranslation(args: {
  messageId: number;
  targetLanguageId: number;
  translatedText: string;
}) {
  await pool.query(insertMessageTranslationSql, [
    args.messageId,
    args.targetLanguageId,
    args.translatedText,
  ]);
}

