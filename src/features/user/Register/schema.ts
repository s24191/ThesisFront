import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email({ message: "Must be a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
