import express from 'express';
import { createPost, getAllPosts, getMyPosts } from '../controllers/post.controllers.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', auth, getAllPosts);
router.post('/create-post', auth, createPost);
router.get('/myposts', auth, getMyPosts);

export default router;