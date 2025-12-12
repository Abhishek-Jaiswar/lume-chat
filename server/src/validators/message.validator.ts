import { Types } from "mongoose";
import { z } from "zod";

export const sendMessageSchema = z
  .object({
    chatId: z.string().trim().min(1),
    content: z.string().trim().optional(),
    image: z.string().trim().optional(),
    replyToId: z
      .string()
      .trim()
      .optional()
      .refine((val) => val !== "", {
        message: "replyTo cannot be an empty string",
      }),
  })
  .refine((data) => data.content || data.image, {
    message: "Either content or image must be provided",
    path: ["content"],
  });
