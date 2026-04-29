import { Server, Socket } from 'socket.io';

// Use a Map for better performance than a plain object
const userSocketMap = new Map<number, string>();

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  const user = (socket as any).user;
  const userId = user.id;

  // 1. Map the user immediately
  userSocketMap.set(userId, socket.id);
  console.log(`User ${userId} (${user.username}) connected on socket ${socket.id}`);

  // 2. Handle Message Event
  socket.on('send_message', async (data) => {
    // We'll add the DB save logic here next!
    console.log(`Message from ${userId} to ${data.receiverId}: ${data.text}`);
  });

  // 3. Cleanup on disconnect
  socket.on('disconnect', () => {
    userSocketMap.delete(userId);
    console.log(`User ${userId} disconnected`);
  });
};