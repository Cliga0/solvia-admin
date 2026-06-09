export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_ID: "userId",
  USER_EMAIL: "userEmail",
} as const;

export const AUTH_COOKIE_OPTIONS = {
  ACCESS_TOKEN: {
    name: "accessToken",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
    sameSite: "lax" as const,
  },
};

export const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000; // 1 minute before actual expiry
