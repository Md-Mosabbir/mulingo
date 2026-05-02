import { Request, Response } from 'express';
import { fail, ok } from '../utils/response';
import { getLanguageCodeById } from '../sql/language';
import { translateText } from '../services/translation';
import { getUserPreferredLanguageId, getMessagesPage, upsertMessageTranslation } from '../sql/chat/messages';
import { isUserInChat } from '../sql/chat/rooms';
import { getMyMembership } from '../sql/chat/groups';

async function ensureChatAccess(chatId: number, userId: number): Promise<boolean> {
  // Works for both private and group chats; group membership is still in chat_members.
  return isUserInChat(chatId, userId);
}

export async function getRoomMessages(req: Request, res: Response) {
  return getChatMessages(req, res, 'room');
}

export async function getGroupMessages(req: Request, res: Response) {
  return getChatMessages(req, res, 'group');
}

async function getChatMessages(req: Request, res: Response, kind: 'room' | 'group') {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const chatId = Number(req.params.id);
    if (!Number.isFinite(chatId) || chatId <= 0) return fail(res, `Invalid ${kind} id`, 400);

    // For groups, ensure membership explicitly (same as rooms, but gives clearer 403).
    if (kind === 'group') {
      const membership = await getMyMembership(chatId, authUserId);
      if (!membership) return fail(res, 'Forbidden', 403);
    } else {
      const allowed = await ensureChatAccess(chatId, authUserId);
      if (!allowed) return fail(res, 'Forbidden', 403);
    }

    const preferredLanguageId = await getUserPreferredLanguageId(authUserId);
    if (!preferredLanguageId) return fail(res, 'Preferred language not set', 400);

    const cursor = req.query.cursor ? Number(req.query.cursor) : null;
    const limit = req.query.limit ? Number(req.query.limit) : 30;

    const rows = await getMessagesPage({
      chatId,
      targetLanguageId: preferredLanguageId,
      cursorMessageId: Number.isFinite(cursor as any) ? cursor : null,
      limit: Number.isFinite(limit) ? limit : 30,
    });

    const targetCode = await getLanguageCodeById(preferredLanguageId);
    if (!targetCode) return fail(res, 'Unknown target language', 400);

    // Translate missing translations on the fly, and cache in DB.
    const out = await Promise.all(
      rows.map(async (m: any) => {
        let translatedText = m.translated_text;
        if (!translatedText && m.original_text && m.message_type === 'text') {
          const sourceCode = await getLanguageCodeById(Number(m.source_language_id));
          if (sourceCode) {
            try {
              translatedText = await translateText({
                text: String(m.original_text),
                from: sourceCode,
                to: targetCode,
              });
              await upsertMessageTranslation({
                messageId: Number(m.message_id),
                targetLanguageId: preferredLanguageId,
                translatedText,
              });
            } catch {
              // If translation fails, fall back to original text.
              translatedText = m.original_text;
            }
          } else {
            translatedText = m.original_text;
          }
        }

        return {
          message_id: m.message_id,
          chat_id: m.chat_id,
          sender_id: m.sender_id,
          sender_username: m.sender_username,
          sender_avatar: m.sender_avatar,
          source_language_id: m.source_language_id,
          message_type: m.message_type,
          original_text: m.original_text,
          translated_text: translatedText,
          sent_at: m.sent_at,
        };
      }),
    );

    const nextCursor = out.length ? out[out.length - 1].message_id : null;
    return ok(res, { items: out, next_cursor: nextCursor });
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

