import { api } from "@/lib/api";

export const loginUser = async (email: string, password: string) => {
  const form = new URLSearchParams();
  form.append("grant_type", "password");
  form.append("username", email);
  form.append("password", password);

  const res = await api.post("/auth/jwt/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data;
};

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export const registerUser = async (data: RegisterRequest) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};
