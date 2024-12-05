// src/routes/exportActivityRoutes.ts

import { Router } from 'express';
import exportActivityController from '../controllers/exportActivityController';
import { authenticate } from '../middleware/auth';
import { logActivity } from '../middleware/activityLogger';

const router = Router();

// 应用认证中间件
router.use(authenticate);

// 获取导出预览信息
router.get('/preview', exportActivityController.getExportPreview);

// 导出活动日志
router.get('/download', 
    logActivity({
        type: 'export_data',
        getDescription: (req) => `导出活动日志 (${req.query.format || 'csv'})`,
        getMetadata: (req) => ({
            format: req.query.format,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            activityType: req.query.activityType
        })
    }),
    exportActivityController.exportActivities
);

export default router;