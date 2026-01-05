import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { ModelMessage, streamText } from "ai";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config";
import { Chat } from "../models/chat.model";
import { Message } from "../models/message.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import {
  emitChatAI,
  emitLastMessageToParticipants,
  emitNewChatMessageToChatRoom,
} from "../lib/socket";
import { Env } from "../config/env.config";
import { User } from "../models/user.model";

const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: Env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const sendMessageService = async (
  userId: string,
  body: {
    chatId: string;
    content?: string;
    image?: string;
    replyToId?: string;
  }
) => {
  const { chatId, content, image, replyToId } = body;

  const chat = await Chat.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found or unauthorized");

  if (replyToId) {
    const replyMessage = await Message.findOne({
      _id: replyToId,
      chatId,
    });

    if (!replyMessage) throw new NotFoundException("Reply message not found");
  }

  let imageUrl;
  if (image) {
    //Upload Image to cld
    const uploadRes = await cloudinary.uploader.upload(image);
    imageUrl = uploadRes.secure_url;
  }

  const newMessage = await Message.create({
    chatId,
    sender: userId,
    content,
    image: imageUrl,
    replyTo: replyToId,
  });

  await newMessage.populate([
    { path: "sender", select: "name avatar" },
    {
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    },
  ]);

  chat.lastMessage = newMessage._id as mongoose.Types.ObjectId;
  await chat.save();

  // websocket emit the new message to the chat room
  emitNewChatMessageToChatRoom(userId, chatId, newMessage);

  // websocket emit the lastMessage to members (personal room user)

  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitLastMessageToParticipants(allParticipantIds, chatId, newMessage);

  let aiResponse: any = null;
  if (chat.isAiChat) {
    aiResponse = await getAiResponse(chatId, userId);
    if (aiResponse) {
      chat.lastMessage = newMessage._id as mongoose.Types.ObjectId;
      await chat.save();
    }
  }

  return {
    userMessages: newMessage,
    chat,
    aiResponse,
    isAiChat: chat.isAiChat,
  };
};

const getAiResponse = async (chatId: string, userId: string) => {
  const lumeAi = await User.findOne({ isAi: true });
  if (!lumeAi) throw new NotFoundException("Lume AI user not found");

  const chatHistory = await getChatHistory(chatId);

  const formattedMessages: ModelMessage[] = chatHistory.map((msg: any) => {
    const role = msg.sender.isAi ? "assistant" : "user";
    const parts: any[] = [];

    if (msg.image) {
      parts.push({
        type: "image",
        data: msg.image,
        mediaType: "image/png",
        fileName: "image.png",
      });

      if (!msg.content) {
        parts.push({
          type: "text",
          text: "Describe the above image. based on what you see.",
        });
      }

      if (msg.content) {
        parts.push({
          type: "text",
          text: msg.replyTo
            ? `Replying to: ${msg.replyTo.content}\n${msg.content}`
            : msg.content,
        });
      }
    }

    return { role, content: parts };
  });

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    messages: formattedMessages,
    system:
      "You are Lume AI, a helpful and creative assistant. Provide detailed and informative responses to the user queries. Use the images sent by the user to enhance your responses when applicable.",
  });

  let fullResponse = "";
  for await (const chunk of result.textStream) {
    emitChatAI({
      chatId,
      chunk,
      sender: lumeAi,
      done: false,
      message: null,
    });
    fullResponse += chunk;

    if (!fullResponse.trim()) return "";

    const aiMessage = await Message.create({
      chatId,
      sender: lumeAi?._id,
      content: fullResponse,
    });

    await aiMessage.populate("sender", "name avatar isAi");

    // Emit ai full response
    emitChatAI({
      chatId,
      chunk: null,
      sender: lumeAi,
      done: true,
      message: aiMessage,
    });

    emitLastMessageToParticipants([userId], chatId, aiMessage);

    return aiMessage;
  }
};

const getChatHistory = async (chatId: string) => {
  const messages = await Message.find({ chatId })
    .populate("sender", "isAi")
    .populate("replyTo", "content")
    .sort({ createdAt: 1 })
    .limit(5)
    .lean();

  return messages.reverse();
};
