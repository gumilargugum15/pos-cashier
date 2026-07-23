import axios from "axios";
import type { PaginationMeta } from "@/types/common";

const AUTH_TOKEN_KEY = "nova_pos_token";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiSuccessPaginated<T> = {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
};

export type ApiError = {
  success: false;
  message: string;
  errors: Record<string, string[]>;
};
