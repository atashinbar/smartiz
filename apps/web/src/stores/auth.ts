import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserType, AdminRole } from "@smartiz/shared";

interface User {
  id: number;
  phone: string;
  userType: UserType | AdminRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "smartiz-auth" }
  )
);
