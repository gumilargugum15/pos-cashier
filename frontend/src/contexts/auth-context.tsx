import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import * as authApi from "@/api/auth";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/api-client";
import type { LoginPayload, User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  hasPermission: (permission: string) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .me()
      .then(setUser)
      .catch(() => {
        clearAuthToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedInUser, token } = await authApi.login(payload);
    setAuthToken(token);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuthToken();
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateUser, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}
