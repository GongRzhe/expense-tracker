// src/routes/userSettingsRoutes.ts

import { Router } from 'express';
import userSettingsController from '../controllers/userSettingsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 应用认证中间件
router.use(authenticate);

// 获取用户设置
router.get('/settings', userSettingsController.getUserSettings);

// 更新用户设置
router.put('/settings', userSettingsController.updateUserSettings);

// 获取汇率信息
router.get('/currency-rates', userSettingsController.getCurrencyRates);

export default router;