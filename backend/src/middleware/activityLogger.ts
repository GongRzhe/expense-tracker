// src/middleware/activityLogger.ts

import { Request, Response, NextFunction } from 'express';
import activityLogService from '../services/activityLogService';

export interface ActivityLogOptions {
    type: string;
    getDescription?: (req: Request) => string;
    getMetadata?: (req: Request) => any;
}

export const logActivity = (options: ActivityLogOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json;
        
        res.json = function(body) {
            if (body?.success && req.user) {
                activityLogService.logActivity({
                    userId: req.user.id,
                    type: options.type,
                    description: options.getDescription ? options.getDescription(req) : '',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    metadata: options.getMetadata ? options.getMetadata(req) : undefined
                }).catch(console.error);
            }
            return originalJson.call(this, body);
        };

        next();
    };
};

// 使用示例：
/*
router.post('/export', 
    logActivity({
        type: 'export_data',
        getDescription: (req) => `导出${req.query.format}格式数据`,
        getMetadata: (req) => ({
            format: req.query.format,
            dateRange: req.query.dateRange
        })
    }),
    exportController.exportData
);
*/