import { Comment } from "../models/comment.models.js";
import { SocialLike } from "../models/like.models.js";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../services/ApiError.js";
import { ApiResponse } from "../services/ApiResponse.js";

const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const posts = await Post.find({ postedBy: userId }).populate(
    "postedBy",
    "_id name"
  );
  const postsWithLikeCount = await Promise.all(
    posts.map(async (post) => {
      const likeCount = await SocialLike.countDocuments({ postId: post._id });
      const commentCount = await Comment.countDocuments({ postId: post._id });
      const comments = await Comment.find({ postId: post._id }).populate(
        "author",
        "_id name"
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

  return res.status(200).json(new ApiResponse(200, {user, posts: postsWithLikeCount}, "User profile fetched successfully"));
};

export { getUserProfile };
