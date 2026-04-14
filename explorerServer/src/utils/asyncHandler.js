// Higher-order function that wraps an async Express route handler so that
// any rejected promise is automatically forwarded to Express's error pipeline
// via next(err), removing the need for try/catch boilerplate in every controller.
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
