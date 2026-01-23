import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  first_name: z.string().max(50).optional().or(z.literal("")),
  last_name: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
