import {
  z,
} from "zod";

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
});

export type UserProfile = z.infer<
  typeof userProfileSchema
>;

export const loginResponseSchema = z.object({
  access_token: z.string().min(1),

  token_type: z.literal("bearer").optional(),
});

export type LoginResponse = z.infer<
  typeof loginResponseSchema
>;