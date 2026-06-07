export const REDIS_KEYS = {
  AUTH_LOGIN_ATTEMPTS: "auth:attempts:",
  AUTH_BLACKLIST: "auth:blacklist:",
  AUTH_SESSION_CACHE: "auth:session:",
  AUTH_USER_SESSIONS: "auth:user_sessions:",
  AUTH_RESET_REQUESTS: "auth:reset_requests:",
  AUTH_USER_PERMISSIONS: "auth:user_permissions:",
} as const;
