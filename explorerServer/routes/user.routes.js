import express from 'express';
import { getCurrentLoginUser, loginUser, registerUser } from '../controllers/auth/user.controllers.js';
import { auth } from '../middlewares/auth.js';
import { getUserProfile, followAndUnfollowUser } from '../controllers/profile.controllers.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/currentloginuser', auth, getCurrentLoginUser );

router.get('/profile/:userId', auth, getUserProfile);
router.post('/follow-user/:userId', auth, followAndUnfollowUser);

export default router;