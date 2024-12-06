// src/routes/activityLogRoutes.ts

import { Router } from 'express';
import { authenticate, checkRole } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

// 应用认证中间件
router.use(authenticate);

class ActivityLogController {
    // 获取用户的活动日志
    async getUserActivities(req: any, res: any) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            const result = await pool.query(`
                SELECT * FROM activity_logs
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
            `, [req.user.id, limit, offset]);

            const countResult = await pool.query(
                'SELECT COUNT(*) FROM activity_logs WHERE user_id = $1',
                [req.user.id]
            );

            res.json({
                success: true,
                data: {
                    activities: result.rows,
                    total: parseInt(countResult.rows[0].count),
                    page: Number(page),
                    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
                }
            });
        } catch (error) {
            console.error('获取活动日志错误:', error);
            res.status(500).json({
                success: false,
                error: '获取活动日志失败'
            });
        }
    }

    // 获取最近活动（管理员）
    async getRecentActivities(req: any, res: any) {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            
            const result = await pool.query(`
                SELECT 
                    al.*,
                    u.username
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC
                LIMIT $1
            `, [limit]);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取最近活动错误:', error);
            res.status(500).json({
                success: false,
                error: '获取最近活动失败'
            });
        }
    }

    // 获取活动统计
    async getActivityStatistics(req: any, res: any) {
        try {
            const params = [];
            let userFilter = '';

            if (req.user.role !== 'admin') {
                userFilter = 'WHERE user_id = $1';
                params.push(req.user.id);
            }

            const result = await pool.query(`
                SELECT 
                    activity_type,
                    COUNT(*) as count,
                    MIN(created_at) as earliest,
                    MAX(created_at) as latest
                FROM activity_logs
                ${userFilter}
                GROUP BY activity_type
                ORDER BY count DESC
            `, params);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取活动统计错误:', error);
            res.status(500).json({
                success: false,
                error: '获取活动统计失败'
            });
        }
    }

    // 清理旧日志（管理员）
    async cleanOldLogs(req: any, res: any) {
        try {
            const daysToKeep = parseInt(req.query.days as string) || 90;
            
            const result = await pool.query(`
                DELETE FROM activity_logs
                WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
                RETURNING id
            `);

            res.json({
                success: true,
                data: {
                    deletedCount: result.rowCount
                },
                message: `已清理 ${result.rowCount} 条旧日志`
            });
        } catch (error) {
            console.error('清理旧日志错误:', error);
            res.status(500).json({
                success: false,
                error: '清理旧日志失败'
            });
        }
    }
}

const activityLogController = new ActivityLogController();

// 用户路由
router.get('/my-activities', activityLogController.getUserActivities);

// 管理员路由
router.get('/recent', checkRole(['admin']), activityLogController.getRecentActivities);
router.get('/statistics', activityLogController.getActivityStatistics);
router.post('/clean', checkRole(['admin']), activityLogController.cleanOldLogs);

export default router;