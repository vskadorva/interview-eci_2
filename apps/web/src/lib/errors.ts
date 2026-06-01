import { ApiError } from "./api";

export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}
