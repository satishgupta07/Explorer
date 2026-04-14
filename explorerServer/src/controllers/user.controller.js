import Joi from "joi";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Helper: generate a new access + refresh token pair for the given user.
// The refresh token is persisted to the DB so it can be invalidated on logout.
// validateBeforeSave: false skips schema validation since we're only updating
// the refreshToken field, not the full document.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

// POST /api/v1/users/register
// Accepts multipart/form-data so the avatar file can be uploaded alongside
// the text fields. Flow: validate → check duplicate → upload avatar to
// Cloudinary → create user record → return sanitised user object.
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input shape before hitting the database.
  // confirm_password uses Joi.ref to enforce it matches password.
  const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    confirm_password: Joi.ref("password"),
  });

  const { error } = registerSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error);
  }

  // Prevent duplicate accounts with the same email address.
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Avatar is required — multer places it under req.files.avatar[0].
  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload to Cloudinary; the local temp file is cleaned up inside the utility.
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Mongoose's pre-save hook hashes the password automatically before insert.
  const user = await User.create({
    name,
    avatar: avatar.url,
    email,
    password,
  });

  // Re-fetch to get a clean document without sensitive fields for the response.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

// POST /api/v1/users/login
// Validates credentials, issues JWT tokens, and sends them as both cookies
// (for browser clients) and in the JSON body (for mobile/API clients).
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // bcrypt comparison — this method is defined on the User model.
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // httpOnly prevents client-side JS from reading the cookie (XSS protection).
  // secure ensures the cookie is only sent over HTTPS in production.
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Tokens are returned in both cookies and the JSON body so that clients
  // without cookie support (e.g. mobile apps) can still authenticate.
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

// POST /api/v1/users/logout  (protected)
// Invalidates the session by removing the refresh token from the DB, then
// clears both JWT cookies on the response.
const logoutUser = asyncHandler(async (req, res) => {
  // $unset removes the refreshToken field entirely rather than setting it to null,
  // so a future refresh-token request will correctly fail.
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Getting Refresh Token from Request
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    // Verifying the Refresh Token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Finding User by ID
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generating New Access and Refresh Tokens
    // Note: generateAccessAndRefreshTokens returns `refreshToken`, not `newRefreshToken`.
    // Aliasing here for clarity so the variable name doesn't shadow the incoming token.
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  // Accepts `name` and/or `email` — at least one must be provided.
  const { name, email } = req.body;

  if (!name && !email) {
    throw new ApiError(400, "At least one field (name or email) is required");
  }

  const updates = {};
  if (name)  updates.name  = name.trim();
  if (email) updates.email = email.trim().toLowerCase();

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updates },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

// GET /api/v1/users/search?q=  (protected)
// Case-insensitive substring search across name and email fields.
// Returns up to 10 results, excluding the requesting user themselves.
const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();

  if (!q) {
    return res.status(200).json(new ApiResponse(200, [], "No query provided"));
  }

  const users = await User.find({
    $or: [
      { name:  { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
    _id: { $ne: req.user._id }, // exclude self from results
  })
    .select("_id name avatar email")
    .limit(10)
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Search results fetched"));
});

// GET /api/v1/users/following  (protected)
// Returns the full user objects for everyone the authenticated user follows,
// used by the Stories strip to show real followed-user avatars.
const getUserFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("following")
    .populate("following", "_id name avatar")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, user.following ?? [], "Following list fetched"));
});

// GET /api/v1/users/suggestions  (protected)
// Returns up to 5 users the authenticated user is NOT already following
// (and not themselves), ordered by most followers for relevance.
// Used by the SuggestedUsers sidebar widget on the frontend.
const getSuggestedUsers = asyncHandler(async (req, res) => {
  const excludedIds = [...(req.user.following ?? []), req.user._id];

  const suggestedUsers = await User.find({
    _id: { $nin: excludedIds },
  })
    .select("_id name avatar followers")
    .sort({ "followers.length": -1 }) // most-followed first
    .limit(5)
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, suggestedUsers, "Suggested users fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getSuggestedUsers,
  searchUsers,
  getUserFollowing,
};
