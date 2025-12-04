import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { chatIdSchema, createChatSchema } from "../validators/chat.validator";
import { HTTPSTATUS } from "../config/http.config";
import {
  createChatService,
  getSingleChatService,
  getUserChatService,
} from "../services/chat.service";

export const createChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createChatSchema.parse(req.body);

    const chat = await createChatService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Chat created successfully",
      chat,
    });
  }
);

export const getUserChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const chats = await getUserChatService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User chats retrived successfully",
      chats,
    });
  }
);

export const getSingleChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id } = chatIdSchema.parse(req.params);

    const { chat, messages } = await getSingleChatService(id, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User chats retrived successfully",
      chat,
      messages,
    });
  }
);
