import {
  z,
} from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, {
      message:
        "Username must be at least 3 characters.",
    })
    .max(30, {
      message:
        "Username must be 30 characters or fewer.",
    }),

  first_name: z
    .string()
    .max(50, {
      message:
        "First name must be 50 characters or fewer.",
    })
    .optional()
    .or(z.literal("")),

  last_name: z
    .string()
    .max(50, {
      message:
        "Last name must be 50 characters or fewer.",
    })
    .optional()
    .or(z.literal("")),

  email: z.string().email({
    message:
      "Enter a valid email address.",
  }),

  password: z.string().min(6, {
    message:
      "Password must be at least 6 characters.",
  }),
});

export type RegisterFormValues = z.infer<
  typeof registerSchema
>;