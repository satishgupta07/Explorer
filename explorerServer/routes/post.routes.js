import express from 'express';
import { createPost, deletePost, getAllPosts, getMyPosts} from '../controllers/post.controllers.js';
import { auth } from '../middlewares/auth.js';
import { likeDislikePost } from '../controllers/like.controllers.js';

const router = express.Router();

router.get('/', auth, getAllPosts);
router.post('/create-post', auth, createPost);
router.get('/myposts', auth, getMyPosts);
router.delete('/deletepost/:postId', auth, deletePost);

router.post('/post/:postId', auth, likeDislikePost)

export default router;