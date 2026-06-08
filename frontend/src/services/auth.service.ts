import { apiUrl } from "@/constants/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorPending {
  pendingToken: string;
  twoFactorRequired: true;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function post<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${apiUrl}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: res.statusText,
    data: null as T,
  }));

  if (!res.ok) {
    throw new Error((json as { message?: string }).message ?? "Request failed");
  }

  return json.data;
}

export const authService = {
  login(credentials: LoginCredentials): Promise<AuthTokens | TwoFactorPending> {
    return post<AuthTokens | TwoFactorPending>("/auth/login", credentials);
  },

  refresh(refreshToken: string): Promise<AuthTokens> {
    return post<AuthTokens>("/auth/refresh", { refreshToken });
  },

  logout(refreshToken: string): Promise<void> {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    return post<void>("/auth/logout", { refreshToken }, token ?? undefined);
  },
};
