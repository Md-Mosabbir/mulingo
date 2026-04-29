import { Server, Socket } from 'socket.io';
import { getUserChatIds } from '../sql/user/chat';

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  const user = (socket as any).user;
  const userId = user.id;

  console.log(`User ${userId} (${user.username}) connected`);

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

  // 2. HANDLE MESSAGE EVENT (Targeting the Chat ID)
  socket.on('send_message', async (data) => {
    const { chatId, text, langId } = data;

    // Logic: 
    // 1. Save to DB (Persistence) - we'll add this function soon
    // 2. Broadcast to everyone in that specific chat room
    io.to(`chat_${chatId}`).emit('receive_message', {
      chatId,
      senderId: userId,
      text,
      sentAt: new Date()
    });

    console.log(`✉️ Message from ${userId} in Chat ${chatId}: ${text}`);
  });

  // 3. CLEANUP
  socket.on('disconnect', () => {
    console.log(`❌ User ${userId} disconnected`);
    // Note: Socket.io automatically leaves all rooms on disconnect.
  });
};