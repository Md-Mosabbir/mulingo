import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { fail, ok } from '../utils/response';
import {
  addChatMember,
  createPrivateChat,
  findExistingPrivateChat,
  getChatParticipants,
  getRoomDetails,
  isUserInChat,
  listMyPrivateRooms,
} from '../sql/chat/rooms';

export async function createOrGetDmRoom(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const data = matchedData(req, { locations: ['body'] }) as { other_user_id: number };
    const otherUserId = Number(data.other_user_id);
    if (!Number.isFinite(otherUserId) || otherUserId <= 0) return fail(res, 'Invalid other_user_id', 400);
    if (otherUserId === authUserId) return fail(res, 'Cannot create DM with yourself', 400);

    const existing =
      (await findExistingPrivateChat(authUserId, otherUserId)) ??
      (await findExistingPrivateChat(otherUserId, authUserId));

    if (existing) {
      return ok(res, { room_id: existing, existed: true });
    }

    const chatId = await createPrivateChat(authUserId);
    await addChatMember(chatId, authUserId, 'owner');
    await addChatMember(chatId, otherUserId, 'member');

    return ok(res, { room_id: chatId, existed: false }, 201);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function listMyRooms(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const rooms = await listMyPrivateRooms(authUserId);
    return ok(res, rooms);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function getRoom(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const roomId = Number(req.params.id);
    if (!Number.isFinite(roomId) || roomId <= 0) return fail(res, 'Invalid room id', 400);

    const allowed = await isUserInChat(roomId, authUserId);
    if (!allowed) return fail(res, 'Forbidden', 403);

    const room = await getRoomDetails(roomId);
    if (!room) return fail(res, 'Room not found', 404);

    const participants = await getChatParticipants(roomId);
    return ok(res, { ...room, participants });
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

