import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Middleware that protects routes requiring authentication.
// Looks for the access token in cookies first (SSR/browser flows), then falls
// back to the Authorization header (mobile / API clients that send Bearer tokens).
// Attaches the sanitised user document to req.user so downstream controllers
// don't need to repeat the DB lookup.
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Support both cookie-based and header-based token delivery.
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log(token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the token signature and decode the payload.
    // Throws if the token is expired, tampered with, or uses the wrong secret.
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch the user from DB to confirm they still exist (e.g. not deleted).
    // Exclude sensitive fields so they never accidentally leak into req.user.
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
