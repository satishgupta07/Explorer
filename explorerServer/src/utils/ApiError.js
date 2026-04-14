// Custom error class for API-level errors.
// Extends the native Error so instances can be caught by Express error handlers
// and carry an HTTP status code alongside the standard message/stack.
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],  // optional array of field-level validation errors
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false; // always false for errors — mirrors ApiResponse.success
    this.errors = errors;

    if (stack) {
      // Accept an externally supplied stack trace (useful when re-wrapping errors).
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
