import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import api from "../api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: User["role"]) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("pct_token");
    const savedUser = localStorage.getItem("pct_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser) as User);
    }

    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("pct_token", data.token);
    localStorage.setItem("pct_user", JSON.stringify(data.user));
  }

  async function register(name: string, email: string, password: string, role: User["role"]) {
    const { data } = await api.post<{ token: string; user: User }>("/auth/register", {
      name,
      email,
      password,
      role,
    });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("pct_token", data.token);
    localStorage.setItem("pct_user", JSON.stringify(data.user));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("pct_token");
    localStorage.removeItem("pct_user");
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
