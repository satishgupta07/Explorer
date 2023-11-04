import express from 'express';
import { getCurrentLoginUser, loginUser, registerUser } from '../controllers/auth/user.controllers.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/currentloginuser', auth, getCurrentLoginUser );

export default router;