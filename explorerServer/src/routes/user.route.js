import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  getSuggestedUsers,
  updateAccountDetails,
  updateUserAvatar,
  changeCurrentPassword,
  searchUsers,
  getUserFollowing,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getUserProfile,
  followAndUnfollowUser,
} from "../controllers/profile.controller.js";

const router = Router();

// Public routes — no auth required.

// multipart/form-data to handle the avatar file upload alongside text fields.
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1, // only one avatar per registration
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// Protected routes — verifyJWT middleware runs before the controller.
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/profile/:userId").get(verifyJWT, getUserProfile);
router.route("/follow-user/:userId").post(verifyJWT, followAndUnfollowUser);

// Suggested users for the sidebar widget (people not yet followed by current user).
router.route("/suggestions").get(verifyJWT, getSuggestedUsers);

// Profile update routes — both require authentication.
// PATCH so only the supplied fields change (not a full replacement).
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(
  verifyJWT,
  upload.single("avatar"), // multer saves the file locally before the controller runs
  updateUserAvatar
);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// Search and social-graph query routes.
router.route("/search").get(verifyJWT, searchUsers);           // ?q=<query>
router.route("/following").get(verifyJWT, getUserFollowing);   // list who I follow

export default router;
