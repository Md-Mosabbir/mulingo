import pool from '../../config/db';
import {
  addChatMemberSql,
  assertUserInChatSql,
  createPrivateChatSql,
  findExistingPrivateChatSql,
  getChatParticipantsSql,
  getRoomDetailsSql,
  listMyPrivateRoomsSql,
} from './rooms.sql';

export async function findExistingPrivateChat(userA: number, userB: number): Promise<number | null> {
  const [rows]: any = await pool.query(findExistingPrivateChatSql, [userA, userB]);
  return rows[0]?.chat_id ?? null;
}

export async function createPrivateChat(createdBy: number): Promise<number> {
  const [result]: any = await pool.query(createPrivateChatSql, [createdBy]);
  return result.insertId;
}

export async function addChatMember(chatId: number, userId: number, role: 'owner' | 'admin' | 'member') {
  await pool.query(addChatMemberSql, [chatId, userId, role]);
}

export async function isUserInChat(chatId: number, userId: number): Promise<boolean> {
  const [rows]: any = await pool.query(assertUserInChatSql, [chatId, userId]);
  return Boolean(rows[0]);
}

export async function getRoomDetails(chatId: number) {
  const [rows]: any = await pool.query(getRoomDetailsSql, [chatId]);
  return rows[0] || null;
}

export async function getChatParticipants(chatId: number) {
  const [rows]: any = await pool.query(getChatParticipantsSql, [chatId]);
  return rows;
}

export async function listMyPrivateRooms(userId: number) {
  const [rows]: any = await pool.query(listMyPrivateRoomsSql, [userId]);
  return rows;
}

