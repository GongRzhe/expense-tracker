// src/services/activityLogService.ts

import pool from '../config/database';

export type ActivityType = 
    | 'login'
    | 'logout'
    | 'profile_update'
    | 'password_change'
    | 'expense_create'
    | 'expense_update'
    | 'expense_delete'
    | 'category_create'
    | 'category_update'
    | 'category_delete'
    | 'settings_update'
    | 'export_data';

interface LogActivity {
    userId: number;
    type: ActivityType;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

class ActivityLogService {
    async logActivity({
        userId,
        type,
        description,
        ipAddress,
        userAgent,
        metadata
    }: LogActivity) {
        try {
            await pool.query(
                `INSERT INTO activity_logs (
                    user_id,
                    activity_type,
                    description,
                    ip_address,
                    user_agent,
                    metadata
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    userId,
                    type,
                    description,
                    ipAddress,
                    userAgent,
                    metadata ? JSON.stringify(metadata) : null
                ]
            );
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    async getUserActivities(userId: number, page: number = 1, limit: number = 20) {
        try {
            const offset = (page - 1) * limit;
            
            const result = await pool.query(
                `SELECT * FROM activity_logs
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3`,
                [userId, limit, offset]
            );

            const countResult = await pool.query(
                'SELECT COUNT(*) FROM activity_logs WHERE user_id = $1',
                [userId]
            );

            return {
                activities: result.rows,
                total: parseInt(countResult.rows[0].count),
                page,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            };
        } catch (error) {
            console.error('Error fetching user activities:', error);
            throw error;
        }
    }

    async getRecentActivities(limit: number = 100) {
        try {
            const result = await pool.query(
                `SELECT 
                    al.*,
                    u.username,
                    u.email
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC
                LIMIT $1`,
                [limit]
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            throw error;
        }
    }

    async getActivityStatistics() {
        try {
            // 获取最近30天的活动统计
            const dailyStats = await pool.query(`
                SELECT 
                    DATE_TRUNC('day', created_at) as date,
                    activity_type,
                    COUNT(*) as count
                FROM activity_logs
                WHERE created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE_TRUNC('day', created_at), activity_type
                ORDER BY date DESC, activity_type
            `);

            // 获取按类型统计的活动数量
            const typeStats = await pool.query(`
                SELECT 
                    activity_type,
                    COUNT(*) as count
                FROM activity_logs
                GROUP BY activity_type
                ORDER BY count DESC
            `);

            // 获取最活跃用户
            const activeUsers = await pool.query(`
                SELECT 
                    u.id,
                    u.username,
                    COUNT(*) as activity_count
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
                WHERE al.created_at >= NOW() - INTERVAL '30 days'
                GROUP BY u.id, u.username
                ORDER BY activity_count DESC
                LIMIT 10
            `);

            return {
                dailyStats: dailyStats.rows,
                typeStats: typeStats.rows,
                activeUsers: activeUsers.rows
            };
        } catch (error) {
            console.error('Error fetching activity statistics:', error);
            throw error;
        }
    }

    async cleanOldLogs(daysToKeep: number = 90) {
        try {
            const result = await pool.query(
                `DELETE FROM activity_logs
                WHERE created_at < NOW() - INTERVAL '$1 days'
                RETURNING id`,
                [daysToKeep]
            );

            return result.rowCount;
        } catch (error) {
            console.error('Error cleaning old logs:', error);
            throw error;
        }
    }
}

export const activityLogService = new ActivityLogService();
export default activityLogService;