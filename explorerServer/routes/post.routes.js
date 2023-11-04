import express from 'express';
import { createPost } from '../controllers/post.controllers.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create-post', auth, createPost);

export default router;