import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  socket = io(`${import.meta.env.VITE_API_URL}`, {
    path: "/socket.io",
    transports: ["websocket"],
    secure: true,
    withCredentials: true,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
