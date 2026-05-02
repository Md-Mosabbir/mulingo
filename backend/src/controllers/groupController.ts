import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { fail, ok } from '../utils/response';
import { addChatMember } from '../sql/chat/rooms';
import {
  addGroupMember,
  createGroupChat,
  getGroupDetails,
  getGroupMembers,
  getMyMembership,
  listMyGroups,
  MemberRole,
  removeGroupMember,
  setMemberMuted,
  updateGroupChat,
  updateMemberRole,
} from '../sql/chat/groups';

function isAdminRole(role: MemberRole) {
  return role === 'owner' || role === 'admin';
}

function normalizeRequestedRole(role: string): MemberRole | null {
  const r = role.trim().toLowerCase();
  if (r === 'admin') return 'admin';
  // Schema does not have 'moderator'; map it to 'admin' behaviorally.
  if (r === 'moderator') return 'admin';
  if (r === 'member') return 'member';
  return null;
}

export async function createGroup(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const data = matchedData(req, { locations: ['body'] }) as {
      name: string;
      description?: string;
      image_url?: string;
    };

    const name = data.name.trim();
    if (!name) return fail(res, 'name is required', 400);

    const chatId = await createGroupChat({
      name,
      image: typeof data.image_url === 'string' ? data.image_url.trim() : null,
      createdBy: authUserId,
    });

    await addChatMember(chatId, authUserId, 'owner');

    // Schema has no description column; we accept it but cannot persist it.
    const group = await getGroupDetails(chatId);
    return ok(res, { ...group, description: data.description ?? null }, 201);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function getGroup(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const groupId = Number(req.params.id);
    if (!Number.isFinite(groupId) || groupId <= 0) return fail(res, 'Invalid group id', 400);

    const membership = await getMyMembership(groupId, authUserId);
    if (!membership) return fail(res, 'Forbidden', 403);

    const group = await getGroupDetails(groupId);
    if (!group) return fail(res, 'Group not found', 404);

    const members = await getGroupMembers(groupId);
    return ok(res, { ...group, members });
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function listGroups(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const groups = await listMyGroups(authUserId);
    return ok(res, groups);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function updateGroup(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const groupId = Number(req.params.id);
    if (!Number.isFinite(groupId) || groupId <= 0) return fail(res, 'Invalid group id', 400);

    const membership = await getMyMembership(groupId, authUserId);
    if (!membership || !isAdminRole(membership.member_role)) return fail(res, 'Admin only', 403);

    const data = matchedData(req, { locations: ['body'] }) as {
      name?: string;
      description?: string;
      image_url?: string;
    };

    await updateGroupChat({
      chatId: groupId,
      name: typeof data.name === 'string' ? data.name.trim() : null,
      image: typeof data.image_url === 'string' ? data.image_url.trim() : null,
    });

    const updated = await getGroupDetails(groupId);
    return ok(res, { ...updated, description: data.description ?? null });
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function addMember(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const groupId = Number(req.params.id);
    const data = matchedData(req, { locations: ['body'] }) as { user_id: number };
    const userId = Number(data.user_id);
    if (!Number.isFinite(groupId) || groupId <= 0) return fail(res, 'Invalid group id', 400);
    if (!Number.isFinite(userId) || userId <= 0) return fail(res, 'Invalid user_id', 400);

    const membership = await getMyMembership(groupId, authUserId);
    if (!membership || !isAdminRole(membership.member_role)) return fail(res, 'Admin only', 403);

    await addGroupMember(groupId, userId);
    const members = await getGroupMembers(groupId);
    return ok(res, { group_id: groupId, members });
  } catch (err: any) {
    // MySQL duplicate key for (chat_id, user_id)
    if (err?.code === 'ER_DUP_ENTRY') return fail(res, 'User already a member', 409);
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function removeMember(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const groupId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (!Number.isFinite(groupId) || groupId <= 0) return fail(res, 'Invalid group id', 400);
    if (!Number.isFinite(userId) || userId <= 0) return fail(res, 'Invalid user id', 400);

    const membership = await getMyMembership(groupId, authUserId);
    if (!membership || !isAdminRole(membership.member_role)) return fail(res, 'Admin only', 403);

    await removeGroupMember(groupId, userId);
    const members = await getGroupMembers(groupId);
    return ok(res, { group_id: groupId, members });
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function muteMember(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const groupId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (!Number.isFinite(groupId) || groupId <= 0) return fail(res, 'Invalid group id', 400);
    if (!Number.isFinite(userId) || userId <= 0) return fail(res, 'Invalid user id', 400);

    const membership = await getMyMembership(groupId, authUserId);
    if (!membership || !isAdminRole(membership.member_role)) return fail(res, 'Admin only', 403);

    // Schema supports a boolean mute only. Duration (minutes) is accepted but not persisted.
    await setMemberMuted(groupId, userId, true);
    return ok(res, { group_id: groupId, user_id: userId, muted: true });
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function unmuteMember(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const groupId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (!Number.isFinite(groupId) || groupId <= 0) return fail(res, 'Invalid group id', 400);
    if (!Number.isFinite(userId) || userId <= 0) return fail(res, 'Invalid user id', 400);

    const membership = await getMyMembership(groupId, authUserId);
    if (!membership || !isAdminRole(membership.member_role)) return fail(res, 'Admin only', 403);

    await setMemberMuted(groupId, userId, false);
    return ok(res, { group_id: groupId, user_id: userId, muted: false });
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function changeMemberRole(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const groupId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (!Number.isFinite(groupId) || groupId <= 0) return fail(res, 'Invalid group id', 400);
    if (!Number.isFinite(userId) || userId <= 0) return fail(res, 'Invalid user id', 400);

    const membership = await getMyMembership(groupId, authUserId);
    if (!membership || !isAdminRole(membership.member_role)) return fail(res, 'Admin only', 403);

    const data = matchedData(req, { locations: ['body'] }) as { role: string };
    const normalized = normalizeRequestedRole(data.role);
    if (!normalized) return fail(res, 'Invalid role', 400);

    // Prevent demoting the owner via this endpoint (no schema support for ownership transfer).
    const members = await getGroupMembers(groupId);
    const target = members.find((m: any) => m.user_id === userId);
    if (!target) return fail(res, 'User is not a member', 404);
    if (target.member_role === 'owner') return fail(res, 'Cannot change owner role', 400);

    await updateMemberRole(groupId, userId, normalized);
    const updatedMembers = await getGroupMembers(groupId);
    return ok(res, { group_id: groupId, members: updatedMembers });
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

// Ban/unban are requested, but the current schema has no place to persist per-group bans.
export async function banMember(_req: Request, res: Response) {
  return fail(res, 'Ban is not supported by current schema', 501);
}

export async function unbanMember(_req: Request, res: Response) {
  return fail(res, 'Unban is not supported by current schema', 501);
}

