import { handleApiError } from "@/lib/axios-api-error";
import { API } from "@/lib/axios-client";
import type { TUser } from "@/types/auth.types";
import type {
  ChatType,
  CreateChatType,
  CreateMessageType,
  MessageType,
} from "@/types/chat-types";
import { create } from "zustand";
import { useAuth } from "./use-auth";
import { generateUUID } from "@/lib/helper";

interface IChat {
  chats: ChatType[];
  users: TUser[];
  singleChat: {
    chat: ChatType;
    messages: MessageType[];
  } | null;

  isChatLoading: boolean;
  isUsersLoading: boolean;
  isCreatingChat: boolean;
  isSingleChatLoading: boolean;

  fetchAllUsers: () => Promise<void>;
  fetchChats: () => Promise<void>;
  createChats: (payload: CreateChatType) => Promise<ChatType>;
  sendMessage: (payload: CreateMessageType) => void;
  fetchSingleChat: (chatId: string) => Promise<void>;
  addNewChat: (newChat: ChatType) => void;
  updateChatLastMessage: (chatId: string, lastMessage: MessageType) => void;
  addNewMessage: (chatId: string, message: MessageType) => void;
}

export const useChat = create<IChat>()((set, get) => ({
  chats: [],
  users: [],
  singleChat: null,

  isChatLoading: false,
  isUsersLoading: false,
  isCreatingChat: false,
  isSingleChatLoading: false,

  fetchAllUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await API.get("/user/all");
      set({ users: data.users });
    } catch (error) {
      const err = handleApiError(error);
      console.error("Fetch users failed:", err.message);
      throw err;
    } finally {
      set({ isUsersLoading: false });
    }
  },

  fetchChats: async () => {
    set({ isChatLoading: true });
    try {
      const { data } = await API.get("/chat/all");
      set({ chats: data.chats });
    } catch (error) {
      const err = handleApiError(error);
      console.error("Fetch chats failed:", err.message);
      throw err;
    } finally {
      set({ isChatLoading: false });
    }
  },

  createChats: async (payload: CreateChatType) => {
    set({ isCreatingChat: true });
    try {
      const { data } = await API.post("/chat/create", payload);
      get().addNewChat(data.chat);
      return data.chat;
    } catch (error) {
      const err = handleApiError(error);
      console.error("Create chat failed:", err.message);
      throw err;
    } finally {
      set({ isCreatingChat: false });
    }
  },

  sendMessage: async (payload: CreateMessageType) => {
    const { chatId, content, replyTo, image } = payload;
    const { user } = useAuth.getState();
    if (!chatId || !user?._id) return;

    const tempMsgId = generateUUID();

    const tempMessage = {
      _id: tempMsgId,
      chatId,
      content: content || "",
      image: image || null,
      sender: user,
      replyTo: replyTo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "sending...",
    };

    set((state) => {
      if (state.singleChat?.chat?._id !== chatId) return state;
      return {
        singleChat: {
          ...state.singleChat,
          messages: [...state.singleChat.messages, tempMessage],
        },
      };
    });

    try {
      const { data } = await API.post("/chat/message/send", {
        chatId,
        content,
        image,
        replyToId: replyTo?._id,
      });

      const { userMessages: userMessage } = data;

      if (!userMessage || !userMessage._id) {
        console.error("Invalid message received from API:", userMessage);
        return;
      }

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: state.singleChat.messages.map((msg) =>
              msg._id === tempMsgId ? userMessage : msg
            ),
          },
        };
      });
    } catch (error) {
      const err = handleApiError(error);
      console.error("Failed to send message:", err.message);
      throw err;
    } finally {
      set({ isCreatingChat: false });
    }
  },

  fetchSingleChat: async (chatId: string) => {
    set({ isSingleChatLoading: true });
    try {
      const { data } = await API.get(`/chat/${chatId}`);
      set({
        singleChat: {
          chat: data.chat,
          messages: data.messages,
        },
      });
    } catch (error) {
      const err = handleApiError(error);
      console.error("Fetch single chat failed:", err.message);
      throw err;
    } finally {
      set({ isSingleChatLoading: false });
    }
  },

  addNewChat: (newChat: ChatType) => {
    set((state) => {
      const exists = state.chats.some((c) => c._id === newChat._id);

      return {
        chats: exists
          ? [newChat, ...state.chats.filter((c) => c._id !== newChat._id)]
          : [newChat, ...state.chats],
      };
    });
  },

  updateChatLastMessage: (chatId, lastMessage) => {
    set((state) => {
      const chat = state.chats.find((c) => c._id === chatId);
      if (!chat) return state;
      return {
        chats: [
          { ...chat, lastMessage },
          ...state.chats.filter((c) => c._id !== chatId),
        ],
      };
    });
  },

  addNewMessage: (chatId, message) => {
    if (!message || !message._id) {
      console.warn("Attempted to add invalid message:", message);
      return;
    }

    const chat = get().singleChat;
    if (chat?.chat._id === chatId) {
      set({
        singleChat: {
          chat: chat.chat,
          messages: [...chat.messages, message],
        },
      });
    }
  },
}));
