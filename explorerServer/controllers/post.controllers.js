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

const likePost = async (req, res, next) => {
  Post.findByIdAndUpdate(
    req.body._id,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
};

const unlikePost = async (req, res, next) => {
  Post.findByIdAndUpdate(
    req.body._id,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
};

export { createPost, getAllPosts, getMyPosts, likePost, unlikePost };
