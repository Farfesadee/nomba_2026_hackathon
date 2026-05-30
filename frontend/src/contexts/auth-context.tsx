"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiClient, setToken, clearToken } from "@/lib/api-client";

type User = {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_verified: boolean;
  verification_channel: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, first_name: string, last_name: string, phone?: string, verification_channel?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const u = await apiClient<User>("/auth/me");
      setUser(u);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("access_token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await apiClient<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (email: string, password: string, first_name: string, last_name: string, phone?: string, verification_channel?: string) => {
    const res = await apiClient<{ access_token: string; user: User }>("/auth/register", {
      method: "POST",
      body: { email, password, first_name, last_name, phone: phone || null, verification_channel: verification_channel || "email" },
    });
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
