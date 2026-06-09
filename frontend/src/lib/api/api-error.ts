import { APP_ERRORS, ERROR_MESSAGES } from "@/constants/errors";

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly data: unknown;

  constructor(
    message: string,
    code: string = APP_ERRORS.UNKNOWN_ERROR,
    status: number = 500,
    data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.data = data;
  }

  static fromResponse(response: Response, data?: unknown): ApiError {
    const status = response.status;

    let code: string;
    let message: string;

    if (status === 401) {
      code = APP_ERRORS.UNAUTHORIZED;
      message = ERROR_MESSAGES[APP_ERRORS.UNAUTHORIZED];
    } else if (status === 403) {
      code = APP_ERRORS.FORBIDDEN;
      message = ERROR_MESSAGES[APP_ERRORS.FORBIDDEN];
    } else if (status === 404) {
      code = APP_ERRORS.NOT_FOUND;
      message = ERROR_MESSAGES[APP_ERRORS.NOT_FOUND];
    } else if (status === 422) {
      code = APP_ERRORS.VALIDATION_ERROR;
      message = (data as { message?: string })?.message ?? ERROR_MESSAGES[APP_ERRORS.VALIDATION_ERROR];
    } else if (status >= 500) {
      code = APP_ERRORS.SERVER_ERROR;
      message = ERROR_MESSAGES[APP_ERRORS.SERVER_ERROR];
    } else {
      code = APP_ERRORS.UNKNOWN_ERROR;
      message = (data as { message?: string })?.message ?? ERROR_MESSAGES[APP_ERRORS.UNKNOWN_ERROR];
    }

    return new ApiError(message, code, status, data);
  }

  static fromNetworkError(): ApiError {
    return new ApiError(
      ERROR_MESSAGES[APP_ERRORS.NETWORK_ERROR],
      APP_ERRORS.NETWORK_ERROR,
      0,
    );
  }

  isUnauthorized(): boolean {
    return this.code === APP_ERRORS.UNAUTHORIZED;
  }

  isForbidden(): boolean {
    return this.code === APP_ERRORS.FORBIDDEN;
  }

  isNetworkError(): boolean {
    return this.code === APP_ERRORS.NETWORK_ERROR;
  }
}
