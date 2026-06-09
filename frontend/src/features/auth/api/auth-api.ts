import { apiClient } from "@/lib/api/api-client";
import type { AuthLoginResult } from "@/types/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TwoFactorVerifyRequest {
  pendingToken: string;
  code: string;
}

export const authApi = {
  login(credentials: LoginCredentials): Promise<AuthLoginResult> {
    return apiClient.post<AuthLoginResult>("/auth/login", credentials, { skipAuth: true });
  },

  verifyTwoFactor(data: TwoFactorVerifyRequest): Promise<AuthLoginResult> {
    return apiClient.post<AuthLoginResult>("/auth/2fa/verify", data, { skipAuth: true });
  },

  logout(): Promise<void> {
    return apiClient.post<void>("/auth/logout", {});
  },
};
