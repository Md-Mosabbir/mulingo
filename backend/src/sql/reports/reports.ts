import pool from '../../config/db';
import {
  chatAggregateStatsSql,
  chatsForUserUsingInSubquerySql,
  distinctSendersInChatSql,
  userChatOverviewViewSql,
} from './reports.sql';

export async function distinctSendersInChat(chatId: number) {
  const [rows]: any = await pool.query(distinctSendersInChatSql, [chatId]);
  return rows;
}

export async function chatsForUserUsingInSubquery(userId: number, limit: number) {
  const safeLimit = Math.max(1, Math.min(200, limit));
  const [rows]: any = await pool.query(chatsForUserUsingInSubquerySql, [userId, safeLimit]);
  return rows;
}

export async function chatAggregateStats(chatId: number, minCount: number) {
  const [rows]: any = await pool.query(chatAggregateStatsSql, [chatId, minCount]);
  return rows[0] || null;
}

export async function userChatOverviewFromView(userId: number, limit: number) {
  const safeLimit = Math.max(1, Math.min(200, limit));
  const [rows]: any = await pool.query(userChatOverviewViewSql, [userId, safeLimit]);
  return rows;
}

