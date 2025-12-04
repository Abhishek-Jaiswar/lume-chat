import { z } from "zod";

export const createChatSchema = z.object({
  participantId: z.string().optional(),
  isGroup: z.boolean().optional(),
  participants: z.array(z.string()).optional(),
  groupName: z.string().optional(),
});

export const chatIdSchema = z.object({
  id: z.string(),
});

export type CreateChatBody = z.infer<typeof createChatSchema>;
export type ChatIdSchemaType = z.infer<typeof chatIdSchema>;
