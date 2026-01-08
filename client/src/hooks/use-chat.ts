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
  isSendingMsg: boolean;

  fetchAllUsers: () => Promise<void>;
  fetchChats: () => Promise<void>;
  createChats: (payload: CreateChatType) => Promise<ChatType>;
  sendMessage: (payload: CreateMessageType, isAiChat: boolean) => void;
  fetchSingleChat: (chatId: string) => Promise<void>;
  addNewChat: (newChat: ChatType) => void;
  updateChatLastMessage: (chatId: string, lastMessage: MessageType | null) => void;
  addNewMessage: (chatId: string, message: MessageType, tempId?: string) => void;

  addOrUpdateChatMessage: (
    chatId: string,
    message: MessageType,
    tempId?: string
  ) => void;
  deleteChat: (chatId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  removeChat: (chatId: string) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  handleAiStream: (payload: {
    chatId: string;
    chunk: string | null;
    done: boolean;
    message: MessageType | null;
  }) => void;
}

export const useChat = create<IChat>()((set, get) => ({
  chats: [],
  users: [],
  singleChat: null,

  isChatLoading: false,
  isUsersLoading: false,
  isCreatingChat: false,
  isSingleChatLoading: false,
  isSendingMsg: false,

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

  sendMessage: async (payload: CreateMessageType, isAiChat: boolean) => {
    set({ isSendingMsg: true });

    const { chatId, content, replyTo, image } = payload;
    const { user } = useAuth.getState();
    const chat = get().singleChat?.chat;
    const aiSender = chat?.participants.find((p) => p.isAi);

    if (!chatId || !user?._id) return;

    const tempUserId = generateUUID();
    const tempAiId = generateUUID();

    const tempMessage = {
      _id: tempUserId,
      chatId,
      content: content || "",
      image: image || null,
      sender: user,
      replyTo: replyTo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: !isAiChat ? "sending..." : "",
    };

    // Add user message locally
    get().addOrUpdateChatMessage(chatId, tempMessage, tempUserId);

    if (isAiChat && aiSender) {
      const aiMessage = {
        _id: tempAiId,
        chatId,
        content: "",
        image: null,
        sender: aiSender,
        replyTo: null,
        streaming: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "sending...",
      } as any;

      // Add AI placeholder locally
      get().addOrUpdateChatMessage(chatId, aiMessage, tempAiId);
    }

    try {
      const { data } = await API.post("/chat/message/send", {
        chatId,
        content,
        image,
        replyToId: replyTo?._id,
      });

      const { userMessages, aiResponse } = data;

      if (!userMessages || !userMessages._id) {
        console.error("Invalid message received from API:", userMessages);
        return;
      }

      // Replace the temp user message with the real one
      get().addOrUpdateChatMessage(chatId, userMessages, tempUserId);

      // If AI response returned immediately (e.g. non-streaming or fallback), update it
      if (isAiChat && aiResponse) {
        get().addOrUpdateChatMessage(chatId, aiResponse, tempAiId);
      }
    } catch (error) {
      const err = handleApiError(error);
      console.error("Failed to send message:", err.message);
      throw err;
    } finally {
      set({ isSendingMsg: false });

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
          { ...chat, lastMessage: lastMessage as MessageType },
          ...state.chats.filter((c) => c._id !== chatId),
        ],
      };
    });
  },

  addNewMessage: (chatId, message) => {
    get().addOrUpdateChatMessage(chatId, message);
  },

  addOrUpdateChatMessage: (chatId, message, tempId) => {
    const singleChat = get().singleChat;
    if (!singleChat || singleChat.chat._id !== chatId) return;

    const messages = singleChat.messages;

    // 1. Try to find existing message by:
    //    a. tempId (if provided)
    //    b. real _id (if already exists)
    //    c. content match (for race conditions where socket arrives before API creates ID)
    const msgIndex = messages.findIndex((msg) => {
      if (tempId && msg._id === tempId) return true;
      if (message._id && msg._id === message._id) return true;
      if (
        !tempId &&
        msg.sender?._id === message.sender?._id &&
        msg.content === message.content &&
        msg.status === "sending..."
      )
        return true;
      return false;
    });

    if (msgIndex !== -1) {
      const updatedMessages = [...messages];
      // Merge: preserve certain fields like 'streaming' if the update doesn't have it
      updatedMessages[msgIndex] = {
        ...updatedMessages[msgIndex],
        ...message,
        // Ensure we don't accidentally lose the real _id if message came from socket
        _id: message._id || updatedMessages[msgIndex]._id,
      };
      set({
        singleChat: {
          ...singleChat,
          messages: updatedMessages,
        },
      });
    } else {
      set({
        singleChat: {
          ...singleChat,
          messages: [...messages, message],
        },
      });
    }
  },

  handleAiStream: ({ chatId, chunk, done, message }) => {
    const singleChat = get().singleChat;
    if (!singleChat || singleChat.chat._id !== chatId) return;

    const messages = singleChat.messages;
    const lastStreamingMsgIndex = [...messages]
      .reverse()
      .findIndex((m) => m.streaming);

    const actualIndex =
      lastStreamingMsgIndex !== -1
        ? messages.length - 1 - lastStreamingMsgIndex
        : -1;

    if (actualIndex === -1 && !done) return;

    if (chunk && !done && actualIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[actualIndex] = {
        ...updatedMessages[actualIndex],
        content: updatedMessages[actualIndex].content + chunk,
        streaming: true,
      };
      set({
        singleChat: { ...singleChat, messages: updatedMessages },
      });
    } else if (done && message && actualIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[actualIndex] = {
        ...message,
        streaming: false,
      };
      set({
        singleChat: { ...singleChat, messages: updatedMessages },
      });
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      await API.delete(`/chat/${chatId}`);
      get().removeChat(chatId);
    } catch (error) {
      const err = handleApiError(error);
      console.error("Delete chat failed:", err.message);
      throw err;
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      await API.delete(`/chat/message/${messageId}`);
      // Local removal will be handled by message:deleted socket event or manually if needed
      // But for better UX we can find the chatId and remove it immediately
      const chatId = get().singleChat?.chat._id;
      if (chatId) {
        get().removeMessage(chatId, messageId);
      }
    } catch (error) {
      const err = handleApiError(error);
      console.error("Delete message failed:", err.message);
      throw err;
    }
  },

  removeChat: (chatId: string) => {
    set((state) => ({
      chats: state.chats.filter((c) => c._id !== chatId),
      singleChat:
        state.singleChat?.chat._id === chatId ? null : state.singleChat,
    }));
  },

  removeMessage: (chatId: string, messageId: string) => {
    const singleChat = get().singleChat;
    if (!singleChat || singleChat.chat._id !== chatId) return;

    set({
      singleChat: {
        ...singleChat,
        messages: singleChat.messages.filter((m) => m._id !== messageId),
      },
    });
  },
}));
