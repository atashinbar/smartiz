import { useAuthStore } from "../stores/auth.js";
import type { ApiResponse, PaginatedResponse } from "@smartiz/shared";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get<T>(path: string) {
    return request<ApiResponse<T>>(path);
  },

  getPaginated<T>(path: string) {
    return request<PaginatedResponse<T>>(path);
  },

  post<T>(path: string, body?: unknown) {
    return request<ApiResponse<T>>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown) {
    return request<ApiResponse<T>>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string) {
    return request<ApiResponse<T>>(path, { method: "DELETE" });
  },
};
