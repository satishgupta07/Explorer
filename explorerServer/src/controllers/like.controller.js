import { SocialLike } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// POST /api/v1/posts/post/:postId  (protected)
// Toggle like/unlike on a post. A single endpoint handles both actions:
// hitting it while already liked removes the like (unlike), and vice versa.
// The client uses the returned isLiked boolean to update the UI optimistically.
const likeDislikePost = async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post does not exist");
  }

  // Check whether the current user has an existing like record for this post.
  const isAlreadyLiked = await SocialLike.findOne({
    postId,
    likedBy: req.user?._id,
  });

  if (isAlreadyLiked) {
    // Unlike: remove the SocialLike document to decrement the effective count.
    await SocialLike.findOneAndDelete({
      postId,
      likedBy: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        { isLiked: false },
        "Unliked successfully"
      )
    );
  } else {
    // Like: create a new SocialLike document for this user/post pair.
    await SocialLike.create({
      postId,
      likedBy: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        { isLiked: true },
        "Liked successfully"
      )
    );
  }
};

export { likeDislikePost };
