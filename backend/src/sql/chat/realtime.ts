import pool from '../../config/db';
import {
  getChatMembersForRealtimeSql,
  getMyChatMembershipSql,
  insertMessageSql,
  updateLastReadMessageSql,
} from './realtime.sql';

export async function getChatMembersForRealtime(chatId: number) {
  const [rows]: any = await pool.query(getChatMembersForRealtimeSql, [chatId]);
  return rows as Array<{
    user_id: number;
    is_muted: 0 | 1;
    member_role: 'owner' | 'admin' | 'member';
    preferred_language_id: number;
  }>;
}

export async function getMyChatMembership(chatId: number, userId: number) {
  const [rows]: any = await pool.query(getMyChatMembershipSql, [chatId, userId]);
  return rows[0] || null;
}

export async function insertTextMessage(args: {
  chatId: number;
  senderId: number;
  sourceLanguageId: number;
  text: string;
}): Promise<number> {
  const [result]: any = await pool.query(insertMessageSql, [
    args.chatId,
    args.senderId,
    args.sourceLanguageId,
    args.text,
  ]);
  return result.insertId;
}

export async function updateLastReadMessage(args: { chatId: number; userId: number; messageId: number }) {
  await pool.query(updateLastReadMessageSql, [args.messageId, args.chatId, args.userId]);
}

