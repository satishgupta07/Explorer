import express from 'express';
import { likePost, createPost, getAllPosts, getMyPosts, unlikePost } from '../controllers/post.controllers.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', auth, getAllPosts);
router.post('/create-post', auth, createPost);
router.get('/myposts', auth, getMyPosts);
router.put('/like', auth, likePost);
router.put('/unlike', auth, unlikePost);

export default router;