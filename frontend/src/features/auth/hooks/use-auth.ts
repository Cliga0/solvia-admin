"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { usePermissionStore } from "@/stores/permission.store";
import { authApi, type LoginCredentials } from "../api/auth-api";
import { userApi } from "../api/user-api";
import { apiClient } from "@/lib/api/api-client";
import type { AuthTokens, TwoFactorPending } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isInitialized,
    setUser,
    setTokens,
    clearAuth,
    initialize,
  } = useAuthStore();

  const { setPermissions, clearPermissions } = usePermissionStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const loadUserAndPermissions = useCallback(async (userId: string) => {
    try {
      const [userData, permissionsData] = await Promise.all([
        userApi.getCurrentUser(),
        userApi.getUserPermissions(userId),
      ]);

      setUser(userData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error("Failed to load user data:", error);
      clearAuth();
      clearPermissions();
    }
  }, [setUser, setPermissions, clearAuth, clearPermissions]);

  useEffect(() => {
    if (isAuthenticated && accessToken && user === null) {
      const userId = parseUserIdFromToken(accessToken);
      if (userId) {
        loadUserAndPermissions(userId);
      }
    }
  }, [isAuthenticated, accessToken, user, loadUserAndPermissions]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<TwoFactorPending | null> => {
    const result = await authApi.login(credentials);

    if ("twoFactorRequired" in result && result.twoFactorRequired) {
      return result;
    }

    const tokens = result as AuthTokens;
    setTokens(tokens);

    return null;
  }, [setTokens]);

  const verifyTwoFactor = useCallback(async (pendingToken: string, code: string): Promise<void> => {
    const result = await authApi.verifyTwoFactor({ pendingToken, code });
    const tokens = result as AuthTokens;
    setTokens(tokens);
  }, [setTokens]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best effort - always clear auth state
    } finally {
      clearAuth();
      clearPermissions();
      apiClient.clearAuth();
      router.push("/login");
    }
  }, [clearAuth, clearPermissions, router]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isInitialized,
    login,
    verifyTwoFactor,
    logout,
    refreshUser: () => {
      if (accessToken) {
        const userId = parseUserIdFromToken(accessToken);
        if (userId) {
          loadUserAndPermissions(userId);
        }
      }
    },
  };
}

function parseUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}
