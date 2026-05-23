import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AdminData {
  id: number;
  email: string;
  name: string | null;
  role: string;
  lastLogin: string | null;
}

interface AuthContextValue {
  admin: AdminData | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "smartiz_admin_token";
const ADMIN_KEY = "smartiz_admin_data";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminData | null>(() => {
    const stored = localStorage.getItem(ADMIN_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    const { token: jwt, admin: adminData } = data.data;
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
    setToken(jwt);
    setAdmin(adminData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const authFetch = useCallback(
    (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return fetch(url, {
        ...options,
        headers,
      });
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
