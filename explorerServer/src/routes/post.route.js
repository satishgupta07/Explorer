import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getMyPosts,
} from "../controllers/post.controller.js";

import { likeDislikePost } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All post routes are protected — verifyJWT runs before every controller.
router.route("/").get(verifyJWT, getAllPosts);          // global feed
router.post("/create-post", verifyJWT, createPost);    // create a new post
router.get("/myposts", verifyJWT, getMyPosts);          // current user's posts
router.delete("/deletepost/:postId", verifyJWT, deletePost); // delete own post

// Like/unlike toggle — reuses the post router since it relates to a post resource.
router.post("/post/:postId", verifyJWT, likeDislikePost);

export default router;
