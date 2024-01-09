import express from 'express';
import { addComment } from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.post('/post/:postId', verifyJWT, addComment);

export default router;