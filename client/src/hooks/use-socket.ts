import { Socket, io } from "socket.io-client";
import { create } from "zustand";
import { useChat } from "./use-chat";

const BASE_URL =
  import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "/";

interface ISocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useSocket = create<ISocketState>()((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const { socket } = get();

    if (socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("online:users", (userIds: string[]) => {
      console.log("Online users:", userIds);
      set({ onlineUsers: userIds });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Chat listeners
    newSocket.on("chat:new", (chat) => {
      const { addNewChat } = useChat.getState();
      addNewChat(chat);
    });

    newSocket.on("chat:update", ({ chatId, lastMessage }) => {
      const { updateChatLastMessage } = useChat.getState();
      updateChatLastMessage(chatId, lastMessage);
    });

    newSocket.on("chat:deleted", ({ chatId }) => {
      const { removeChat } = useChat.getState();
      removeChat(chatId);
    });

    newSocket.on("message:new", (message) => {
      const { addNewMessage } = useChat.getState();
      if (message.chatId) {
        addNewMessage(message.chatId, message);
      }
    });

    newSocket.on("message:deleted", ({ chatId, messageId }) => {
      const { removeMessage } = useChat.getState();
      removeMessage(chatId, messageId);
    });

    newSocket.on("chat:ai", (payload) => {
      const { handleAiStream } = useChat.getState();
      handleAiStream(payload);
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
