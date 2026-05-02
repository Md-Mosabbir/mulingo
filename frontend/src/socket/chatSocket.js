import { io } from "socket.io-client";
import { socketOrigin } from "../api/client";

let socket = null;
let boundToken = null;

export function getChatSocket(token) {
  if (!token) {
    disconnectChatSocket();
    return null;
  }

  const origin = socketOrigin();
  if (!origin) {
    console.warn("VITE_API_BASE_URL is not set; socket cannot connect.");
    return null;
  }

  if (socket && boundToken !== token) {
    socket.disconnect();
    socket = null;
  }

  boundToken = token;

  if (!socket) {
    socket = io(origin, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
}

export function disconnectChatSocket() {
  boundToken = null;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
