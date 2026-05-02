import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { addChatMember, createPrivateChat, findExistingPrivateChat } from '../sql/chat/rooms';
import { fail, ok } from '../utils/response';

// Legacy controller for /chat/private.
// Prefer /rooms for new integrations.
export const createPrivateRoom = async (req: Request, res: Response) => {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    // Backwards compatible: accept either {other_user_id} or {user2_id}
    const data = matchedData(req, { locations: ['body'] }) as {
      other_user_id?: number;
      user2_id?: number;
    };
    const otherUserId = Number(data.other_user_id ?? data.user2_id);
    if (!Number.isFinite(otherUserId) || otherUserId <= 0) return fail(res, 'user2_id is required', 400);
    if (otherUserId === authUserId) return fail(res, 'Cannot create DM with yourself', 400);

    const existing =
      (await findExistingPrivateChat(authUserId, otherUserId)) ??
      (await findExistingPrivateChat(otherUserId, authUserId));
    if (existing) return ok(res, { chat_id: existing, existed: true });

    const chatId = await createPrivateChat(authUserId);
    await addChatMember(chatId, authUserId, 'owner');
    await addChatMember(chatId, otherUserId, 'member');

    return ok(res, { chat_id: chatId, existed: false }, 201);
  } catch (error) {
    console.error(error);
    return fail(res, 'Internal server error', 500);
  }
};

