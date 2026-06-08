export const AUTH_THROTTLE = {
  LOGIN: { default: { ttl: 60, limit: 5 } },
  REFRESH: { default: { ttl: 60, limit: 20 } },
  LOGOUT: { default: { ttl: 60, limit: 30 } },
  FORGOT_PASSWORD: { default: { ttl: 60, limit: 3 } },
  RESET_PASSWORD: { default: { ttl: 60, limit: 5 } },
  TWO_FACTOR_SETUP: { default: { ttl: 60, limit: 3 } },
  TWO_FACTOR_VERIFY: { default: { ttl: 60, limit: 5 } },
  TWO_FACTOR_DISABLE: { default: { ttl: 60, limit: 3 } },
} as const;
