import axios, {type AxiosError, type InternalAxiosRequestConfig} from "axios";
import {useAuthStore} from "@/features/auth/store/authStore.ts";

const API_URL = import.meta.env.VITE_API_URL;

let isRedirectingToLogin = false;

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === "/login") {
    return;
  }

  if (isRedirectingToLogin) {
    return;
  }

  isRedirectingToLogin = true;

  const currentLocation = [
    window.location.pathname,
    window.location.search,
    window.location.hash,
  ].join("");

  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("redirect", currentLocation);
  window.location.assign(loginUrl.toString());
};

export const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const shouldSkipAuthHandling =
      error.config?.skipAuthErrorHandling === true;

    if (
      error.response?.status === 401 &&
      !shouldSkipAuthHandling
    ) {
      useAuthStore.getState().logout();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);