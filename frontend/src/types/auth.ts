export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorPending {
  pendingToken: string;
  twoFactorRequired: true;
}

export interface User {
  id: string;
  email: string;
  status: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  expiresAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
}

export type AuthLoginResult = AuthTokens | TwoFactorPending;
