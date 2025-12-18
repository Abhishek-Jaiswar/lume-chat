import type { TUser } from "./auth.types";

export type ChatType = {
  _id: string;
  lastMessage: MessageType;
  participants: TUser[];
  isGroup: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageType = {
  _id: string;
  content: string | null;
  image: string | null;
  sender: TUser | null;
  replyTo: MessageType | null;
  chatId: string;
  createdAt: string;
  updated: string;

  status?: string;
};

export type CreateChatType = {
  participantId?: string;
  isGroup?: boolean;
  participants?: string[];
  groupName?: string;
};

export type CreateMessageType = {
  chatId: string;
  content?: string;
  image?: string;
  replyTo: MessageType | null;
};
