import { Comment } from "../models/comment.models.js";
import { ApiResponse } from "../services/ApiResponse.js";

const addComment = async (req, res) => {
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
};

export { addComment };
