import { Request, Response } from 'express';
import { fail, ok } from '../utils/response';
import {
  chatAggregateStats,
  chatsForUserUsingInSubquery,
  distinctSendersInChat,
  userChatOverviewFromView,
} from '../sql/reports/reports';
import { isUserInChat } from '../sql/chat/rooms';

export async function getDistinctSenders(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    const chatId = Number(req.params.chatId);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);
    if (!Number.isFinite(chatId) || chatId <= 0) return fail(res, 'Invalid chat id', 400);

    const allowed = await isUserInChat(chatId, authUserId);
    if (!allowed) return fail(res, 'Forbidden', 403);

    const rows = await distinctSendersInChat(chatId);
    return ok(res, rows);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function getChatsUsingInSubquery(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const rows = await chatsForUserUsingInSubquery(authUserId, Number.isFinite(limit) ? limit : 50);
    return ok(res, rows);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function getChatAggregateStats(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    const chatId = Number(req.params.chatId);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);
    if (!Number.isFinite(chatId) || chatId <= 0) return fail(res, 'Invalid chat id', 400);

    const allowed = await isUserInChat(chatId, authUserId);
    if (!allowed) return fail(res, 'Forbidden', 403);

    const minCount = req.query.minCount ? Number(req.query.minCount) : 1;
    const stats = await chatAggregateStats(chatId, Number.isFinite(minCount) ? minCount : 1);
    return ok(res, stats);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function getMyChatOverviewFromView(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const rows = await userChatOverviewFromView(authUserId, Number.isFinite(limit) ? limit : 50);
    return ok(res, rows);
  } catch (err: any) {
    // If view isn't created in DB yet, MySQL will throw ER_NO_SUCH_TABLE.
    if (err?.code === 'ER_NO_SUCH_TABLE') {
      return fail(
        res,
        'VIEW v_user_chat_overview not found. Run backend/sql/submission_extras.sql to create it.',
        412,
      );
    }
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

