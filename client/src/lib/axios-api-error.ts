import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    return {
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
      status: error.response?.status,
      code: error.code,
    };
  }

  return {
    message: "Unexpected error occurred",
  };
}
