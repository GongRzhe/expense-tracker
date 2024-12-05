// src/routes/authRoutes.ts

import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);

// 需要认证的路由
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

export default router;