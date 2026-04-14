import express from 'express';
import { addComment, deleteComment } from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/v1/comments/post/:postId — add a comment to a post (protected).
router.post('/post/:postId', verifyJWT, addComment);

// DELETE /api/v1/comments/:commentId — delete own comment (protected).
router.delete('/:commentId', verifyJWT, deleteComment);

export default router;