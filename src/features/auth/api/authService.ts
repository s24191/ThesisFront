import {client} from "@/shared/api/client";
import {
  type LoginResponse,
  loginResponseSchema,
  type UserProfile,
  userProfileSchema
} from "@/features/auth/schemas/authSchemas";
import type {RegisterRequest} from "@/features/auth/types/auth";

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const form = new URLSearchParams({
    grant_type: "password",
    username: email,
    password,
  });

  const res = await client.post<unknown>("/auth/jwt/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    skipAuthErrorHandling: true,
  });
  return loginResponseSchema.parse(
    res.data,
  );
};

export const registerUser = async (data: RegisterRequest): Promise<UserProfile> => {
  const response = await client.post<unknown>("/auth/register",
    {
      email: data.email,
      password: data.password,
      username: data.username,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
    },
    {skipAuthErrorHandling: true,}
  );
  return userProfileSchema.parse(
    response.data,
  );
};
