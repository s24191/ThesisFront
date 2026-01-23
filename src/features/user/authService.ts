import { api } from "@/lib/api";

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

export const loginUser = async (email: string, password: string) => {
  const form = new URLSearchParams();
  form.append("grant_type", "password");
  form.append("username", email);
  form.append("password", password);

  const res = await api.post("/auth/jwt/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
};

export const registerUser = async (data: RegisterRequest) => {
  const res = await api.post("/auth/register", {
    email: data.email,
    password: data.password,
    username: data.username,
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
  });
  return res.data; // FastAPI-Users returns the created user, not a token
};
