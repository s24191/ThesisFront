import {create} from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

type AuthState = {
  token: string | null;
  user: UserProfile | null;
  setToken: (token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
};

const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user: null,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
    get().fetchUser();
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },

  fetchUser: async () => {
    const token = get().token;
    if (!token) {
      set({ user: null });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
      const user: UserProfile = await res.json();
      set({ user });
    } catch (e) {
      console.error("fetchUser error", e);
      set({ user: null });
    }
  },
}));
