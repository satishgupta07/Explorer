import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// POST /api/v1/comments/post/:postId  (protected)
// Creates a new comment on the specified post, associating it with the
// authenticated user via req.user._id (set by verifyJWT middleware).
const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  const comment = await Comment.create({
    content,
    author: req.user?._id,
    postId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

// DELETE /api/v1/comments/:commentId  (protected)
// Only the comment's author may delete it — the query matches on both _id and
// author so ownership is enforced at the DB level without a separate check.
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findOneAndDelete({
    _id:    commentId,
    author: req.user._id,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or not authorised");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { addComment, deleteComment };
