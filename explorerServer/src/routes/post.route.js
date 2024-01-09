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

router.route("/").get(verifyJWT, getAllPosts);
router.post("/create-post", verifyJWT, createPost);
router.get("/myposts", verifyJWT, getMyPosts);
router.delete("/deletepost/:postId", verifyJWT, deletePost);

router.post("/post/:postId", verifyJWT, likeDislikePost);

export default router;
