import Joi from "joi";
import { Post } from "../models/post.model.js";
import { SocialLike } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPost = async (req, res, next) => {
  // Validation
  const postSchema = Joi.object({
    title: Joi.string().required(),
    image: Joi.string().required(),
  });

  const { error } = postSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  const { title, image } = req.body;

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

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("postedBy", "_id name avatar");
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
          isLiked: isLiked ? true : false,
          commentCount,
          comments,
        };
      })
    );
    res.json({ posts: postsWithLikeCount });
  } catch (err) {
    return next(err);
  }
};

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
