import express from 'express';
import { registerUser } from '../controllers/auth/user.controller.js';

const router = express.Router();

router.post('/user', registerUser);

export default router;