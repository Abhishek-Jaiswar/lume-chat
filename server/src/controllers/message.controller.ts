import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { chatIdSchema, messageIdSchema } from "../validators/chat.validator";
import { sendMessageSchema } from "../validators/message.validator";
import { HTTPSTATUS } from "../config/http.config";
import {
  deleteMessageService,
  sendMessageService,
} from "../services/message.service";
import { emitMessageDeleted } from "../lib/socket";

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = sendMessageSchema.parse(req.body);

    const result = await sendMessageService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Message sent successfully.",
      success: true,
      ...result,
    });
  }
);

export const deleteMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { messageId } = messageIdSchema.parse(req.params);

    const { chatId, messageId: deletedId } = await deleteMessageService(
      userId,
      messageId
    );

    emitMessageDeleted(chatId, deletedId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Message deleted successfully",
      success: true,
    });
  }
);
