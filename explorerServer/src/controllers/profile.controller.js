import { Comment } from "../models/comment.model.js";
import { SocialLike } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /api/v1/users/profile/:userId  (protected)
// Returns a user's public profile including their posts (with like/comment data),
// their followers/following lists, and a flag for whether the requester already
// follows them (used to toggle the Follow/Unfollow button on the client).
const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check if the requesting user is already in the target user's followers array.
  const isUserInFollowers = user.followers.includes(req.user._id);

  const followers = await User.find(
    { _id: { $in: user.followers } },
    "_id name"
  );

  const following = await User.find(
    { _id: { $in: user.following } },
    "_id name"
  );

  const posts = await Post.find({ postedBy: userId }).populate(
    "postedBy",
    "_id name avatar"
  );
  const postsWithLikeCount = await Promise.all(
    posts.map(async (post) => {
      const likeCount = await SocialLike.countDocuments({ postId: post._id });
      const commentCount = await Comment.countDocuments({ postId: post._id });
      const comments = await Comment.find({ postId: post._id }).populate(
        "author",
        "_id name avatar"
      );
      const isLiked = await SocialLike.exists({
        postId: post._id,
        likedBy: userId,
      });
      return {
        _id: post._id,
        title: post.title,
        image: post.image,
        postedBy: post.postedBy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likeCount,
        commentCount,
        isLiked: isLiked ? true : false,
        comments,
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        posts: postsWithLikeCount,
        isUserInFollowers,
        followers,
        following,
      },
      "User profile fetched successfully"
    )
  );
};

// POST /api/v1/users/follow-user/:userId  (protected)
// Toggle follow/unfollow. Both the requester's `following` array and the target's
// `followers` array must be updated atomically to keep the social graph consistent.
const followAndUnfollowUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(req.user._id);

  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    throw new ApiError(404, "User not found");
  }

  try {
    const isFollowing = user.following.includes(userId);
    if (isFollowing) {
      // Unfollow: remove userId from requester's following, and requester's id
      // from target's followers — Mongoose's .pull() handles both.
      user.following.pull(userId);
      userToFollow.followers.pull(req.user._id);
    } else {
      // Follow: add to both arrays symmetrically.
      user.following.push(userId);
      userToFollow.followers.push(req.user._id);
    }

    // Both documents must be saved for the follow graph to remain consistent.
    await user.save();
    await userToFollow.save();

    const message = isFollowing
      ? "Unfollowed successfully"
      : "Followed successfully";
    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
};

export { getUserProfile, followAndUnfollowUser };
