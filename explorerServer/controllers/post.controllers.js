import Joi from "joi";
import { Post } from "../models/post.models.js";

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
    const posts = await Post.find().populate("postedBy", "_id name");
    res.json({ posts });
  } catch (err) {
    return next(err);
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "_id name"
    );
    res.json({ posts });
  } catch (err) {
    return next(err);
  }
};

export { createPost, getAllPosts, getMyPosts};
