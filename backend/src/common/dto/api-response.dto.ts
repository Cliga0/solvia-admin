export class ApiResponseDto<T> {
  success: boolean;
  message: string;
  data: T;

  constructor(success: boolean, message: string, data: T) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static ok<T>(data: T, message = "Operation successful"): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data);
  }

  static error(message = "An error occurred"): ApiResponseDto<null> {
    return new ApiResponseDto(false, message, null);
  }
}
