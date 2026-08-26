import {create} from "zustand";
import {userProfileSchema, type UserProfile} from "@/features/auth/schemas/authSchemas";
import {client} from "@/shared/api/client.ts";

type AuthState = {
  token: string | null;
  user: UserProfile | null;
  authChecked: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
};

const getStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: getStoredToken(),
  user: null,
  authChecked: false,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token,user: null, authChecked: false });
    void get().fetchUser();
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, authChecked: true });
  },

  fetchUser: async () => {
    const token = get().token;

    if (!token) {
      set({ user: null, authChecked: true });
      return;
    }

    try {
      const res = await client.get<unknown>("/auth/users/me",);

      const user = userProfileSchema.parse(
      res.data,
    );

      set({ user, authChecked: true });
    } catch (e) {
      set({ user: null, authChecked: true });
    }
  },
}));
