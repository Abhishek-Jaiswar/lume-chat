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

  fetchAllUsers: () => void;
  fetchChats: () => void;
  createChats: (payload: CreateChatType) => Promise<ChatType | null>;
  fetchSingleChat: (chatId: string) => void;
  addNewChat: (newChat: ChatType) => void;
}

export const useChat = create<IChat>()((set, get) => ({
  chats: [],
  users: [],
  singleChat: null,
  isChatLoading: false,
  isSingleChatLoading: false,
  isCreatingChat: false,
  isUsersLoading: false,

  fetchAllUsers: async () => {
    set({ isUsersLoading: true });

    try {
      const { data } = await API.get("/user/all");
      set({ users: data.users });
    } catch (error) {
      const err = handleApiError(error);
      return { success: false, error: err.message };
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
      return { success: false, error: err.message };
    } finally {
      set({ isChatLoading: false });
    }
  },

  createChats: async (payload: CreateChatType) => {
    set({ isCreatingChat: true });

    try {
      const response = await API.post("/chat/create", {
        ...payload,
      });

      get().addNewChat(response.data.chat);

      return response.data.chat;
    } catch (error) {
      const err = handleApiError(error);
      return { success: false, error: err.message };
    } finally {
      set({ isCreatingChat: false });
    }
  },

  fetchSingleChat: async () => {
    set({ isSingleChatLoading: true });
  },

  addNewChat: (newChat: ChatType) => {
    set((state) => {
      const existingChatIndex = state.chats.findIndex(
        (c) => c._id === newChat._id
      );

      if (existingChatIndex !== -1) {
        // move the chats up
        return {
          chats: [newChat, ...state.chats.filter((c) => c._id !== newChat._id)],
        };
      } else {
        return {
          chats: [newChat, ...state.chats],
        };
      }
    });
  },
}));
