import { create } from "zustand";
import { authService, type AuthTokens } from "@/services/auth.service";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  initialize: () => void;
  logout: () => Promise<void>;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setTokens(tokens: AuthTokens) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      setCookie("accessToken", tokens.accessToken, 1);
    }
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  },

  clearAuth() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      deleteCookie("accessToken");
    }
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  initialize() {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
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

  async logout() {
    const { refreshToken, clearAuth } = get();
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // logout best-effort
    } finally {
      clearAuth();
    }
  },
}));
