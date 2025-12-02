import { HTTPSTATUS, HttpStatusCodeType } from "../config/http.config";

export const ErrorCodes = {
  ERR_INTERNAL: "ERR_INTERNAL",
  ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
  ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
  ERR_FORBIDDEN: "ERR_FORBIDDEN",
  ERR_NOT_FOUND: "ERR_NOT_FOUND",
  ERR_CONFLICT: "ERROR_CONFLICT",
} as const;

export type ErrorCodeType = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class AppError extends Error {
  public success: boolean = false;

  constructor(
    message: string,
    public statusCode: HttpStatusCodeType = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    public errorCode: ErrorCodeType = ErrorCodes.ERR_INTERNAL,
    success: boolean
  ) {
    super(message);
    this.success = success;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalServerException extends AppError {
  constructor(
    message: string = "Internal Server Error",
    success: boolean = false
  ) {
    super(
      message,
      HTTPSTATUS.INTERNAL_SERVER_ERROR,
      ErrorCodes.ERR_INTERNAL,
      success
    );
  }
}

export class BadRequestException extends AppError {
  constructor(message: string = "Bad Request", success: boolean = false) {
    super(message, HTTPSTATUS.BAD_REQUEST, ErrorCodes.ERR_BAD_REQUEST, success);
  }
}

export class UnautorizedException extends AppError {
  constructor(
    message: string = "Unautorized Access",
    success: boolean = false
  ) {
    super(
      message,
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodes.ERR_UNAUTHORIZED,
      success
    );
  }
}

export class NotFoundException extends AppError {
  constructor(
    message: string = "Resource not found",
    success: boolean = false
  ) {
    super(message, HTTPSTATUS.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND, success);
  }
}
