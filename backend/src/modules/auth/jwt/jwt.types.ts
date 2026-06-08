export type JwtUserPayload = {
  sub: string;
  email: string;
};

export type AccessTokenPayload = JwtUserPayload;

export type PendingTokenPayload = {
  sub: string;
  twoFactorPending: true;
};

export type RefreshTokenPayload = {
  sub: string;
  sessionId: string;
};
