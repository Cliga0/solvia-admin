import { apiUrl } from "@/constants/api";
import { AUTH_STORAGE_KEYS } from "@/constants/auth";
import { ApiError } from "./api-error";
import { ApiResponse } from "./api-response";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipAuth?: boolean;
  skipRetry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}

function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  document.cookie = "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    throw new ApiError("No refresh token", "UNAUTHORIZED", 401);
  }

  try {
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      throw new ApiError("Token refresh failed", "UNAUTHORIZED", 401);
    }

    const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = json.data;

    setTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch (error) {
    clearTokens();
    throw error instanceof ApiError
      ? error
      : new ApiError("Token refresh failed", "UNAUTHORIZED", 401);
  }
}

async function getOrRefreshToken(): Promise<string | null> {
  const token = getAccessToken();
  if (token) return token;

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retries = 0,
): Promise<T> {
  const {
    method = "GET",
    body,
    headers: customHeaders,
    signal,
    skipAuth = false,
    skipRetry = false,
  } = options;

  const url = `${apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (!skipAuth) {
    const token = await getOrRefreshToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    if (response.status === 401 && !skipAuth && !skipRetry && retries < 1) {
      clearTokens();
      refreshPromise = null;

      try {
        const newToken = await getOrRefreshToken();

        const retryHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...customHeaders,
          Authorization: `Bearer ${newToken}`,
        };

        const retryResponse = await fetch(url, {
          method,
          headers: retryHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal,
        });

        if (!retryResponse.ok) {
          let retryData: unknown;
          try {
            retryData = await retryResponse.json();
          } catch {
            retryData = { message: retryResponse.statusText };
          }
          throw ApiError.fromResponse(retryResponse, retryData);
        }

        const json: ApiResponse<T> = await retryResponse.json();
        return json.data;
      } catch {
        throw new ApiError("Session expired. Please sign in again.", "UNAUTHORIZED", 401);
      }
    }

    throw ApiError.fromResponse(response, data);
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PUT", body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },

  clearAuth(): void {
    clearTokens();
    refreshPromise = null;
  },

  setAuthTokens(accessToken: string, refreshToken: string): void {
    setTokens(accessToken, refreshToken);
  },
};
