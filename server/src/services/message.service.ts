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
      chat.lastMessage = aiResponse._id as mongoose.Types.ObjectId;
      await chat.save();
    }
  }

  return {
    userMessages: newMessage,
    chat,
    aiResponse,
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
        image: new URL(msg.image),
        mimeType: "image/png",
      });

      if (!msg.content) {
        parts.push({
          type: "text",
          text: "Describe the above image based on its visual content.",
        });
      } else {
        parts.push({
          type: "text",
          text: msg.replyTo
            ? `(Replying to: ${msg.replyTo.content})\n\n${msg.content}`
            : msg.content,
        });
      }
    } else if (msg.content) {
      parts.push({
        type: "text",
        text: msg.replyTo
          ? `(Replying to: ${msg.replyTo.content})\n\n${msg.content}`
          : msg.content,
      });
    }

    return { role, content: parts };
  });

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    messages: formattedMessages,
    system:
      "You are Lume AI, a helpful, creative assistant. Provide clear, informative, and engaging responses. If an image is provided, analyze it thoroughly to provide contextually relevant answers.",
  });

  let fullResponse = "";
  for await (const chunk of result.textStream) {
    fullResponse += chunk;
    emitChatAI({
      chatId,
      chunk,
      sender: lumeAi,
      done: false,
      message: null,
    });
  }

  if (!fullResponse.trim()) return null;

  const aiMessage = await Message.create({
    chatId,
    sender: lumeAi?._id,
    content: fullResponse,
  });

  await aiMessage.populate("sender", "name avatar isAi");

  // Emit ai full response done signal
  emitChatAI({
    chatId,
    chunk: null,
    sender: lumeAi,
    done: true,
    message: aiMessage,
  });

  emitLastMessageToParticipants([userId], chatId, aiMessage);

  return aiMessage;
};

const getChatHistory = async (chatId: string) => {
  const messages = await Message.find({ chatId })
    .populate("sender", "isAi")
    .populate("replyTo", "content")
    .sort({ createdAt: -1 }) // Get latest messages first
    .limit(20) // Get more context
    .lean();

  return messages.reverse(); // Return in chronological order
};
export const deleteMessageService = async (
  userId: string,
  messageId: string
) => {
  const message = await Message.findById(messageId);
  if (!message) throw new NotFoundException("Message not found");

  // Only the sender can delete the message
  if (message.sender.toString() !== userId) {
    throw new BadRequestException("Unauthorized to delete this message");
  }

  const chatId = message.chatId;
  const chat = await Chat.findById(chatId);
  if (!chat) throw new NotFoundException("Chat not found");

  await Message.findByIdAndDelete(messageId);

  // If the deleted message was the lastMessage, update the chat
  if (chat.lastMessage?.toString() === messageId) {
    const previousMessage = await Message.findOne({ chatId })
      .sort({ createdAt: -1 })
      .select("_id");
    chat.lastMessage = previousMessage
      ? (previousMessage._id as mongoose.Types.ObjectId)
      : null;
    await chat.save();

    if (previousMessage) {
      await previousMessage.populate({
        path: "sender",
        select: "name avatar",
      });
    }

    const allParticipantIds = chat.participants.map((id) => id.toString());
    emitLastMessageToParticipants(
      allParticipantIds,
      chatId.toString(),
      previousMessage
    );
  }

  return { chatId: chatId.toString(), messageId };
};
