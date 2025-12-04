import { Types } from "mongoose";
import { Chat } from "../models/chat.model";
import { User } from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import type { CreateChatBody } from "../validators/chat.validator";
import { Message } from "../models/message.model";

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

    return chat;
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
    }).populate("participants", "name avatar");

    if (existingChat) return existingChat;

    chat = await Chat.create({
      participants: allParticipantIds,
      isGroup: false,
      createdBy: new Types.ObjectId(userId),
    });

    return chat;
  }

  throw new Error("Invalid chat creation payload");
};

export const getUserChatService = async (userId: string) => {
  const chats = await Chat.find({
    participants: {
      $in: [userId],
    },
  })
    .populate("participants", "name avatar")
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
  });

  if (!chat)
    throw new BadRequestException(
      "Chat not found or you are not authorized to view this chats"
    );

  const messages = await Message.find({ chatId })
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ createdAt: 1 });

  return {
    chat,
    messages,
  };
};
