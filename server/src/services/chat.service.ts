import { Types } from "mongoose";
import { Chat } from "../models/chat.model";
import { User } from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import type { CreateChatBody } from "../validators/chat.validator";
import { Message } from "../models/message.model";
import { emitNewChatToParticipants } from "../lib/socket";

export const createChatService = async (
  userId: string,
  body: CreateChatBody
) => {
  const { participantId, isGroup, participants, groupName } = body;

  let chat;
  let allParticipantIds: Types.ObjectId[] = [];

  if (isGroup && participants?.length && groupName) {
    allParticipantIds = [
      new Types.ObjectId(userId),
      ...participants.map((id) => new Types.ObjectId(id)),
    ];

    chat = await Chat.create({
      participants: allParticipantIds,
      isGroup: true,
      groupName,
      createdBy: new Types.ObjectId(userId),
    });

    // Populate participants with name and avatar
    const populatedChat = await chat.populate("participants", "name avatar ");
    const participantIdString = populatedChat.participants.map((p: any) => {
      return p._id.toString();
    });

    emitNewChatToParticipants(participantIdString, populatedChat);

    return populatedChat;
  }

  if (participantId) {
    const otherUser = await User.findById(participantId);
    if (!otherUser) throw new NotFoundException("User not found");

    allParticipantIds = [
      new Types.ObjectId(userId),
      new Types.ObjectId(participantId),
    ];

    const existingChat = await Chat.findOne({
      participants: {
        $all: allParticipantIds,
        $size: 2,
      },
      isGroup: false,
    }).populate("participants", "name avatar isAi");

    if (existingChat) return existingChat;

    chat = await Chat.create({
      participants: allParticipantIds,
      isGroup: false,
      createdBy: new Types.ObjectId(userId),
    });

    // Populate participants with name and avatar
    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "name avatar isAi"
    );

    return populatedChat;
  }

  throw new Error("Invalid chat creation payload");
};

export const getUserChatService = async (userId: string) => {
  const chats = await Chat.find({
    participants: {
      $in: [userId],
    },
  })
    .populate("participants", "name avatar isAi")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ updatedAt: -1 });

  return chats;
};

export const getSingleChatService = async (chatId: string, userId: string) => {
  const chat = await Chat.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  }).populate("participants", "name avatar isAi");

  if (!chat)
    throw new BadRequestException(
      "Chat not found or you are not authorized to view this chats"
    );

  const messages = await Message.find({ chatId })
    .populate("sender", "name avatar isAi")
    .populate({
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar isAi",
      },
    })
    .sort({ createdAt: 1 });

  return {
    chat,
    messages,
  };
};

export const validateChatParticipants = async (
  chatId: string,
  userId: string
) => {
  const chat = await Chat.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });

  if (!chat) throw new BadRequestException("User not a participant in chat.");
  return chat;
};

export const deleteChatService = async (chatId: string, userId: string) => {
  const chat = await validateChatParticipants(chatId, userId);

  // Delete all messages in the chat
  await Message.deleteMany({ chatId });

  // Delete the chat itself
  await Chat.findByIdAndDelete(chatId);

  // Notify participants via socket
  const participantIds = chat.participants.map((id) => id.toString());
  // We'll implement emitChatDeleted next
  return { participantIds, chatId };
};
