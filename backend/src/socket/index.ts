import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './handlers';
import { verifyToken } from '../utils/jwt'; // Use your new utility!

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // The Middleware: Runs on every connection attempt
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token ||
      socket.handshake.headers?.token ||
      socket.handshake.query?.token;

    if (!token) {
      console.log("Token missing", token)
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = verifyToken(token);
      (socket as any).user = decoded; // Attach user info to the socket
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
  });

  return io;
};