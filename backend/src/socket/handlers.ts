import { Server, Socket } from 'socket.io';
import { getUserChatIds } from '../sql/user/chat';
import { getLanguageCodeById } from '../sql/language';
import { translateText } from '../services/translation';
import { upsertMessageTranslation } from '../sql/chat/messages';
import { getChatMembersForRealtime, getMyChatMembership, insertTextMessage, updateLastReadMessage } from '../sql/chat/realtime';
import { sendPushNotification } from '../services/notification';

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  const user = (socket as any).user;
  const userId = user.id;

  console.log(`User ${userId} (${user.username}) connected`);

  // Personal room for per-user emits (translations differ per recipient).
  socket.join(`user_${userId}`);

  // 1. JOIN ROOMS
  // When the user connects, find all chat_ids they belong to in the DB
  // and join those rooms immediately.
  const joinRooms = async () => {

    try {
      const chatIds = await getUserChatIds(userId);
      
      chatIds.forEach((chatId) => {
        const roomName = `chat_${chatId}`;
        socket.join(roomName);
        console.log(`User ${userId} joined room: ${roomName}`);
      });
    } catch (err) {
      console.error("Error joining rooms:", err);
    }
  };

  joinRooms();

  socket.on('join_room', async (data) => {
    try {
      const chatId = Number(data?.chatId);
      if (!Number.isFinite(chatId) || chatId <= 0) return;

      const membership = await getMyChatMembership(chatId, userId);
      if (!membership) return;

      socket.join(`chat_${chatId}`);
    } catch (err) {
      console.error('join_room error', err);
    }
  });

  socket.on('leave_room', async (data) => {
    try {
      const chatId = Number(data?.chatId);
      if (!Number.isFinite(chatId) || chatId <= 0) return;
      socket.leave(`chat_${chatId}`);
    } catch (err) {
      console.error('leave_room error', err);
    }
  });

  socket.on('typing', async (data) => {
    try {
      const chatId = Number(data?.chatId);
      const isTyping = Boolean(data?.isTyping);
      if (!Number.isFinite(chatId) || chatId <= 0) return;

      const membership = await getMyChatMembership(chatId, userId);
      if (!membership) return;

      socket.to(`chat_${chatId}`).emit('typing', { chatId, userId, isTyping });
    } catch (err) {
      console.error('typing error', err);
    }
  });

  socket.on('read_receipt', async (data) => {
    try {
      const chatId = Number(data?.chatId);
      const messageId = Number(data?.messageId);
      if (!Number.isFinite(chatId) || chatId <= 0) return;
      if (!Number.isFinite(messageId) || messageId <= 0) return;

      const membership = await getMyChatMembership(chatId, userId);
      if (!membership) return;

      await updateLastReadMessage({ chatId, userId, messageId });
      io.to(`chat_${chatId}`).emit('read_receipt', { chatId, userId, messageId });
    } catch (err) {
      console.error('read_receipt error', err);
    }
  });

  // send_message event:
  // - persist original message + source language
  // - translate per recipient preferred language
  // - emit per-recipient via user_<id> room
  socket.on('send_message', async (data) => {
    try {
      const chatId = Number(data?.chatId);
      const text = typeof data?.text === 'string' ? data.text.trim() : '';
      const sourceLanguageId = Number(data?.langId);

      if (!Number.isFinite(chatId) || chatId <= 0) {
        return socket.emit('send_message_error', { success: false, message: 'Invalid chatId' });
      }
      if (!text) {
        return socket.emit('send_message_error', { success: false, message: 'Message text is required' });
      }
      if (!Number.isFinite(sourceLanguageId) || sourceLanguageId <= 0) {
        return socket.emit('send_message_error', { success: false, message: 'Invalid langId' });
      }

      const membership = await getMyChatMembership(chatId, userId);
      if (!membership) {
        return socket.emit('send_message_error', { success: false, message: 'Forbidden' });
      }
      if (membership.is_muted) {
        return socket.emit('send_message_error', { success: false, message: 'You are muted in this chat' });
      }

      const messageId = await insertTextMessage({
        chatId,
        senderId: userId,
        sourceLanguageId,
        text,
      });

      const sentAt = new Date().toISOString();
      const sourceCode = await getLanguageCodeById(sourceLanguageId);
      if (!sourceCode) {
        return socket.emit('send_message_error', { success: false, message: 'Unknown source language' });
      }

      const members = await getChatMembersForRealtime(chatId);

      await Promise.all(
        members.map(async (m) => {
          const targetLangId = Number(m.preferred_language_id);
          const targetCode = await getLanguageCodeById(targetLangId);
          if (!targetCode) return;

          let translated = text;
          if (targetLangId !== sourceLanguageId) {
            try {
              translated = await translateText({ text, from: sourceCode, to: targetCode });
            } catch {
              translated = text;
            }
          }

          // Cache translation for history fetches.
          await upsertMessageTranslation({
            messageId,
            targetLanguageId: targetLangId,
            translatedText: translated,
          });
          io.to(`user_${m.user_id}`).emit('receive_message', {
            chatId,
            messageId,
            senderId: userId,
            sourceLanguageId,
            originalText: text,
            text: translated,
            sentAt,
          });

          // 4. Send Web Push Notification
          if (Number(m.user_id) !== userId) {
            sendPushNotification(m.user_id, {
              title: `New message from ${user.username}`,
              body: translated,
              icon: '/icons/icon-192x192.png',
              data: {
                chatId,
                url: `/`
              }
            }).catch(err => console.error('Push notification error:', err));
          }
        }),
      );

      console.log(`✉️ Message ${messageId} from ${userId} in Chat ${chatId}`);
    } catch (err) {
      console.error('send_message error', err);
      return socket.emit('send_message_error', { success: false, message: 'Internal server error' });
    }
  });

  // 3. CLEANUP
  socket.on('disconnect', () => {
    console.log(`❌ User ${userId} disconnected`);
    // Note: Socket.io automatically leaves all rooms on disconnect.
  });
};