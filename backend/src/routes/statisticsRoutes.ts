// src/routes/statisticsRoutes.ts

import { Router } from 'express';
import { authenticate, checkRole } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

// 应用认证中间件
router.use(authenticate);

class StatisticsController {
    // 获取概览数据
    async getOverview(req: any, res: any) {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_records,
                    COALESCE(SUM(amount), 0) as total_amount,
                    COALESCE(AVG(amount), 0) as average_amount,
                    COALESCE(MIN(amount), 0) as min_amount,
                    COALESCE(MAX(amount), 0) as max_amount
                FROM expenses
                WHERE user_id = $1 AND date >= NOW() - INTERVAL '30 days'
            `, [req.user.id]);

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('获取概览数据错误:', error);
            res.status(500).json({
                success: false,
                error: '获取概览数据失败'
            });
        }
    }

    // 获取分类统计
    async getCategoryStats(req: any, res: any) {
        try {
            const { startDate, endDate } = req.query;
            const params = [req.user.id];
            let dateFilter = '';
            let paramCount = 2;

            if (startDate) {
                params.push(startDate);
                dateFilter += ` AND date >= $${paramCount}`;
                paramCount++;
            }

            if (endDate) {
                params.push(endDate);
                dateFilter += ` AND date <= $${paramCount}`;
            }

            const result = await pool.query(`
                SELECT 
                    c.name as category_name,
                    COUNT(*) as record_count,
                    COALESCE(SUM(e.amount), 0) as total_amount,
                    COALESCE(AVG(e.amount), 0) as average_amount
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                WHERE e.user_id = $1 ${dateFilter}
                GROUP BY c.id, c.name
                ORDER BY total_amount DESC
            `, params);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取分类统计错误:', error);
            res.status(500).json({
                success: false,
                error: '获取分类统计失败'
            });
        }
    }

    // 获取月度趋势
    async getMonthlyTrend(req: any, res: any) {
        try {
            const result = await pool.query(`
                SELECT 
                    DATE_TRUNC('month', date) as month,
                    COUNT(*) as record_count,
                    COALESCE(SUM(amount), 0) as total_amount,
                    COALESCE(AVG(amount), 0) as average_amount
                FROM expenses
                WHERE user_id = $1
                    AND date >= NOW() - INTERVAL '12 months'
                GROUP BY DATE_TRUNC('month', date)
                ORDER BY month DESC
            `, [req.user.id]);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取月度趋势错误:', error);
            res.status(500).json({
                success: false,
                error: '获取月度趋势失败'
            });
        }
    }

    // 获取每日趋势
    async getDailyTrend(req: any, res: any) {
        try {
            const days = parseInt(req.query.days as string) || 30;
            
            const result = await pool.query(`
                SELECT 
                    date,
                    COUNT(*) as record_count,
                    COALESCE(SUM(amount), 0) as total_amount
                FROM expenses
                WHERE user_id = $1
                    AND date >= NOW() - INTERVAL '${days} days'
                GROUP BY date
                ORDER BY date DESC
            `, [req.user.id]);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取日趋势错误:', error);
            res.status(500).json({
                success: false,
                error: '获取日趋势失败'
            });
        }
    }

    // 获取高额支出
    async getHighExpenses(req: any, res: any) {
        try {
            const result = await pool.query(`
                SELECT 
                    e.*,
                    c.name as category_name
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                WHERE e.user_id = $1
                ORDER BY e.amount DESC
                LIMIT 10
            `, [req.user.id]);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取高额支出错误:', error);
            res.status(500).json({
                success: false,
                error: '获取高额支出失败'
            });
        }
    }

    // 管理员: 获取系统概览
    async getAdminOverview(req: any, res: any) {
        try {
            const result = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM expenses) as total_records,
                    COALESCE(SUM(amount), 0) as total_amount,
                    COALESCE(AVG(amount), 0) as average_amount
                FROM expenses
            `);

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('获取系统概览错误:', error);
            res.status(500).json({
                success: false,
                error: '获取系统概览失败'
            });
        }
    }

    // 管理员: 获取用户统计
    async getUserStats(req: any, res: any) {
        try {
            const result = await pool.query(`
                SELECT 
                    u.id,
                    u.username,
                    COUNT(e.id) as record_count,
                    COALESCE(SUM(e.amount), 0) as total_amount,
                    COALESCE(AVG(e.amount), 0) as average_amount,
                    MAX(e.date) as last_expense_date
                FROM users u
                LEFT JOIN expenses e ON u.id = e.user_id
                GROUP BY u.id, u.username
                ORDER BY total_amount DESC
            `);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取用户统计错误:', error);
            res.status(500).json({
                success: false,
                error: '获取用户统计失败'
            });
        }
    }

    // 管理员: 获取系统统计
    async getSystemStats(req: any, res: any) {
        try {
            // 获取每日系统使用统计
            const dailyStats = await pool.query(`
                SELECT 
                    DATE_TRUNC('day', created_at) as date,
                    COUNT(*) as record_count,
                    COUNT(DISTINCT user_id) as user_count,
                    COALESCE(SUM(amount), 0) as total_amount
                FROM expenses
                WHERE created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE_TRUNC('day', created_at)
                ORDER BY date DESC
            `);

            res.json({
                success: true,
                data: dailyStats.rows
            });
        } catch (error) {
            console.error('获取系统统计错误:', error);
            res.status(500).json({
                success: false,
                error: '获取系统统计失败'
            });
        }
    }
}

const statisticsController = new StatisticsController();

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