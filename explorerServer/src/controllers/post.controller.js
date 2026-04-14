import Joi from "joi";
import { Post } from "../models/post.model.js";
import { SocialLike } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// POST /api/v1/posts/create-post  (protected)
// The image is uploaded to Cloudinary on the client side; only the resulting URL
// is sent here alongside the post title.
const createPost = async (req, res, next) => {
  const postSchema = Joi.object({
    title: Joi.string().required(),
    image: Joi.string().required(), // Cloudinary URL from the client
  });

  const { error } = postSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  const { title, image } = req.body;

  // Strip the password field from the req.user object before embedding it in
  // the post document to avoid accidentally persisting sensitive data.
  req.user.password = undefined;
  const post = new Post({
    title,
    image,
    postedBy: req.user,
  });

  try {
    const createdPost = await post.save();
    return res.status(200).json({ createdPost });
  } catch (err) {
    return next(err);
  }
};

// GET /api/v1/posts/?page=1&limit=10  (protected)
// Returns a paginated, enriched post feed.
//  - page  : 1-based page number (default 1)
//  - limit : posts per page (default 10, max 20)
//  - Response includes `hasMore` so the client knows when to stop fetching.
const getAllPosts = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
    const skip  = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(limit)
        .populate("postedBy", "_id name avatar"),
      Post.countDocuments(),
    ]);

    const postsWithLikeCount = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await SocialLike.countDocuments({ postId: post._id });
        const commentCount = await Comment.countDocuments({ postId: post._id });
        const comments = await Comment.find({ postId: post._id }).populate(
          "author",
          "_id name avatar"
        );
        // SocialLike.exists returns the matching document or null, so we coerce to boolean.
        const isLiked = await SocialLike.exists({
          postId: post._id,
          likedBy: req.user?._id,
        });
        return {
          _id: post._id,
          title: post.title,
          image: post.image,
          postedBy: post.postedBy,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          likeCount,
          isLiked: isLiked ? true : false,
          commentCount,
          comments,
        };
      })
    );

    res.json({
      posts: postsWithLikeCount,
      total,
      page,
      limit,
      hasMore: skip + posts.length < total,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/v1/posts/myposts  (protected)
// Same shape as getAllPosts but filtered to the authenticated user's own posts,
// used to populate the profile page.
const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ postedBy: req.user._id }).populate(
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
          likedBy: req.user?._id,
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
    res.json({ posts: postsWithLikeCount });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/v1/posts/deletepost/:postId  (protected)
// The query matches on both _id and postedBy so a user can only delete their
// own posts — no separate ownership check needed.
const deletePost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findOneAndDelete({
    _id: postId,
    postedBy: req.user._id,
  });

  if (!post) {
    throw new ApiError(404, "Post does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
};

export { createPost, getAllPosts, getMyPosts, deletePost };
