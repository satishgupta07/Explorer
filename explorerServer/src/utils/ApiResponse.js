// Standardised wrapper for all successful API responses.
// Using a consistent shape (statusCode, data, message, success) makes it easy
// for the client to handle responses uniformly without inspecting each endpoint.
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    // Treat any 2xx/3xx status as success; 4xx and above as failure.
    this.success = statusCode < 400;
  }
}

export { ApiResponse };