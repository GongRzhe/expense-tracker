// src/routes/userRoutes.ts

import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 用户自己的路由
router.put('/profile', userController.updateProfile);
router.put('/settings', userController.updateSettings);
router.delete('/account', userController.deleteAccount);

// 管理员路由
router.get('/list', checkRole(['admin']), userController.getUsers);
router.put('/:userId/status', checkRole(['admin']), userController.updateUserStatus);

// 地理位置数据路由
router.get('/map-data', checkRole(['admin']), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                city,
                country,
                latitude,
                longitude,
                COUNT(DISTINCT u.id) as user_count,
                COUNT(e.id) as expense_count,
                COALESCE(SUM(e.amount), 0) as total_amount
            FROM users u
            LEFT JOIN expenses e ON u.id = e.user_id
            WHERE 
                latitude IS NOT NULL 
                AND longitude IS NOT NULL
            GROUP BY city, country, latitude, longitude
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('获取地理位置数据错误:', error);
        res.status(500).json({
            success: false,
            error: '获取地理位置数据失败'
        });
    }
});

// 用户统计路由
router.get('/stats', checkRole(['admin']), async (req, res) => {
    try {
        // 获取基础统计数据
        const statsResult = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
            FROM users
        `);

        // 获取活跃度统计
        const activityResult = await pool.query(`
            SELECT 
                COUNT(DISTINCT user_id) as active_users_30d
            FROM expenses
            WHERE created_at >= NOW() - INTERVAL '30 days'
        `);

        // 获取每月新增用户统计
        const monthlyUsersResult = await pool.query(`
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                COUNT(*) as new_users
            FROM users
            WHERE created_at >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month DESC
        `);

        // 获取用户分布统计
        const locationResult = await pool.query(`
            SELECT 
                country,
                COUNT(*) as user_count
            FROM users
            WHERE country IS NOT NULL
            GROUP BY country
            ORDER BY user_count DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                stats: statsResult.rows[0],
                activity: activityResult.rows[0],
                monthlyGrowth: monthlyUsersResult.rows,
                locationDistribution: locationResult.rows
            }
        });
    } catch (error) {
        console.error('获取用户统计数据错误:', error);
        res.status(500).json({
            success: false,
            error: '获取用户统计数据失败'
        });
    }
});

export default router;