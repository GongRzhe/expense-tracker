// src/routes/statisticsRoutes.ts

import { Router } from 'express';
import statisticsController from '../controllers/statisticsController';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// 应用认证中间件
router.use(authenticate);

// 用户统计路由
router.get('/overview', statisticsController.getOverview);
router.get('/category', statisticsController.getCategoryStats);
router.get('/monthly', statisticsController.getMonthlyTrend);
router.get('/daily', statisticsController.getDailyTrend);
router.get('/high-expenses', statisticsController.getHighExpenses);

// 管理员统计路由
router.get('/admin/overview', checkRole(['admin']), statisticsController.getAdminOverview);
router.get('/admin/user-stats', checkRole(['admin']), statisticsController.getUserStats);
router.get('/admin/system-stats', checkRole(['admin']), statisticsController.getSystemStats);

export default router;