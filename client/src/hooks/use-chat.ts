import { handleApiError } from "@/lib/axios-api-error";
import { API } from "@/lib/axios-client";
import type { TUser } from "@/types/auth.types";
import type { ChatType, CreateChatType, MessageType } from "@/types/chat-types";
import { create } from "zustand";

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
  fetchSingleChat: (chatId: string) => Promise<void>;
  addNewChat: (newChat: ChatType) => void;
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
}));
