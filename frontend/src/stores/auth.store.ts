import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AUTH_STORAGE_KEYS } from "@/constants/auth";
import type { User, AuthTokens } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  initialize: () => void;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: false,

      setUser: (user) => {
        set({ user });
      },

      setTokens: (tokens: AuthTokens) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
          localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
          setCookie("accessToken", tokens.accessToken, 1);
        }
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      setAccessToken: (token: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
          setCookie("accessToken", token, 1);
        }
        set({ accessToken: token });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
          deleteCookie("accessToken");
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      initialize: () => {
        if (typeof window !== "undefined") {
          const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
          const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

          if (accessToken) {
            setCookie("accessToken", accessToken, 1);
          }

          set({
            accessToken,
            refreshToken,
            isAuthenticated: !!accessToken && !!refreshToken,
            isInitialized: true,
          });
        } else {
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: "solvia-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      skipHydration: true,
    },
  ),
);

export function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
    refreshToken: localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
  };
}
