/*  A utility function to handle asynchronous route handlers.
    Wraps the provided requestHandler in a Promise, ensuring any errors are
    caught and passed to the next function.  */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
