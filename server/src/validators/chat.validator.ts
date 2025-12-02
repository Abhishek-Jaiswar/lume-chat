import { z } from "zod";

export const createChatSchema = z.object({
  participantId: z
    .string()
    .trim()
    .min(1, { error: "Participant id is required" })
    .optional(),
  isGroup: z.boolean().optional(),
  participants: z.array(z.string().trim().min(1)).optional(),
  groupName: z.string().trim().min(1).optional,
});

export type createChatSchemaTypes = z.infer<typeof createChatSchema>;
