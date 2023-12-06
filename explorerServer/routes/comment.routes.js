import express from 'express';
import { addComment } from '../controllers/comment.controllers.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/post/:postId', auth, addComment);

export default router;