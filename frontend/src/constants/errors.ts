export const APP_ERRORS = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  [APP_ERRORS.NETWORK_ERROR]: "Network error. Please check your connection.",
  [APP_ERRORS.UNAUTHORIZED]: "Authentication required. Please sign in.",
  [APP_ERRORS.FORBIDDEN]: "You don't have permission to access this resource.",
  [APP_ERRORS.NOT_FOUND]: "The requested resource was not found.",
  [APP_ERRORS.VALIDATION_ERROR]: "Invalid data provided.",
  [APP_ERRORS.SERVER_ERROR]: "Server error. Please try again later.",
  [APP_ERRORS.UNKNOWN_ERROR]: "An unexpected error occurred.",
};
