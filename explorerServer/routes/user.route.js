import express from 'express';
import { getCurrentLoginUser, loginUser, registerUser } from '../controllers/auth/user.controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/user', registerUser);
router.post('/login', loginUser);
router.get('/currentloginuser', auth, getCurrentLoginUser );

export default router;