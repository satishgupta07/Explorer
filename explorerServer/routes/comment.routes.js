import express from 'express';
import { addComment } from '../controllers/comment.controllers.js';
import { auth } from '../middlewares/auth.js';
import { likeDislikeComment } from '../controllers/like.controllers.js';

const router = express.Router();

router.post('/post/:postId', auth, addComment);
router.post('/comment/:commentId', auth, likeDislikeComment)

export default router;