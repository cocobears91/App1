"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const demoUser: UserProfile = {
  id: "demo-user",
  name: "Product Strategist",
  email: "strategist@example.com",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(demoUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setUser({ ...demoUser, email });
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
