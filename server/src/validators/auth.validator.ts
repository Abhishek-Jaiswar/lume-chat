import { email, z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  email: z.email({ pattern: z.regexes.email, error: "Email is required" }),
  password: z.string().trim().min(1, { error: "Password is required" }),
  avatar: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({ pattern: z.regexes.email, error: "Email is required" }),
  password: z.string().trim().min(1, { error: "Password is required" }),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.input<typeof loginSchema>;
