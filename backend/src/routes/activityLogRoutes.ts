// src/routes/activityLogRoutes.ts

import { Router } from 'express';
import activityLogController from '../controllers/activityLogController';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// 应用认证中间件
router.use(authenticate);

// 用户路由 - 获取自己的活动日志
router.get('/my-activities', activityLogController.getUserActivities);

// 管理员路由
router.get('/recent', checkRole(['admin']), activityLogController.getRecentActivities);
router.get('/statistics', checkRole(['admin']), activityLogController.getActivityStatistics);
router.post('/clean', checkRole(['admin']), activityLogController.cleanOldLogs);

export default router;