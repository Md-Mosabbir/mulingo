import pool from '../../config/db';
import {
  addGroupMemberSql,
  createGroupChatSql,
  getGroupDetailsSql,
  getGroupMembersSql,
  getMyMembershipSql,
  listMyGroupsSql,
  removeGroupMemberSql,
  setMemberMutedSql,
  updateGroupChatSql,
  updateMemberRoleSql,
} from './groups.sql';

export type MemberRole = 'owner' | 'admin' | 'member';

export async function createGroupChat(args: {
  name: string;
  image?: string | null;
  createdBy: number;
}): Promise<number> {
  const [result]: any = await pool.query(createGroupChatSql, [args.name, args.image ?? null, args.createdBy]);
  return result.insertId;
}

export async function updateGroupChat(args: { chatId: number; name?: string | null; image?: string | null }) {
  await pool.query(updateGroupChatSql, [args.name ?? null, args.image ?? null, args.chatId]);
}

export async function getGroupDetails(chatId: number) {
  const [rows]: any = await pool.query(getGroupDetailsSql, [chatId]);
  return rows[0] || null;
}

export async function listMyGroups(userId: number) {
  const [rows]: any = await pool.query(listMyGroupsSql, [userId]);
  return rows;
}

export async function getGroupMembers(chatId: number) {
  const [rows]: any = await pool.query(getGroupMembersSql, [chatId]);
  return rows;
}

export async function getMyMembership(chatId: number, userId: number): Promise<null | { member_role: MemberRole; is_muted: 0 | 1 }> {
  const [rows]: any = await pool.query(getMyMembershipSql, [chatId, userId]);
  return rows[0] || null;
}

export async function addGroupMember(chatId: number, userId: number) {
  await pool.query(addGroupMemberSql, [chatId, userId]);
}

export async function removeGroupMember(chatId: number, userId: number) {
  await pool.query(removeGroupMemberSql, [chatId, userId]);
}

export async function updateMemberRole(chatId: number, userId: number, role: MemberRole) {
  await pool.query(updateMemberRoleSql, [role, chatId, userId]);
}

export async function setMemberMuted(chatId: number, userId: number, muted: boolean) {
  await pool.query(setMemberMutedSql, [muted ? 1 : 0, chatId, userId]);
}

