// src/controllers/activityLogController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import { ApiResponse, PaginationQuery } from '../types';

export class ActivityLogController {
    // 搜索活动日志
    async searchActivityLogs(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit = 20,
                startDate,
                endDate,
                activityType,
                searchText,
                sortBy = 'created_at',
                sortOrder = 'desc'
            } = req.query;

            const offset = (Number(page) - 1) * Number(limit);
            const conditions: string[] = [];
            const params: any[] = [];
            let paramCount = 1;

            // 日期范围筛选
            if (startDate) {
                conditions.push(`al.created_at >= $${paramCount}`);
                params.push(startDate);
                paramCount++;
            }

            if (endDate) {
                conditions.push(`al.created_at <= $${paramCount}`);
                params.push(endDate);
                paramCount++;
            }

            // 活动类型筛选
            if (activityType) {
                conditions.push(`al.activity_type = $${paramCount}`);
                params.push(activityType);
                paramCount++;
            }

            // 文本搜索
            if (searchText) {
                conditions.push(`(
                    al.description ILIKE $${paramCount}
                    OR u.username ILIKE $${paramCount}
                    OR u.email ILIKE $${paramCount}
                    OR al.ip_address ILIKE $${paramCount}
                )`);
                params.push(`%${searchText}%`);
                paramCount++;
            }

            // 只能查看自己的日志（非管理员）
            if (req.user.role !== 'admin') {
                conditions.push(`al.user_id = $${paramCount}`);
                params.push(req.user.id);
                paramCount++;
            }

            const whereClause = conditions.length > 0
                ? 'WHERE ' + conditions.join(' AND ')
                : '';

            // 获取总记录数
            const countQuery = `
                SELECT COUNT(*)
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
                ${whereClause}
            `;
            const countResult = await pool.query(countQuery, params);
            const total = parseInt(countResult.rows[0].count);

            // 获取分页数据
            const query = `
                SELECT 
                    al.*,
                    u.username,
                    u.email
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
                ${whereClause}
                ORDER BY al.${sortBy} ${sortOrder}
                LIMIT $${paramCount} OFFSET $${paramCount + 1}
            `;

            params.push(limit, offset);
            const result = await pool.query(query, params);

            res.json({
                success: true,
                data: {
                    items: result.rows,
                    total,
                    page: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    hasMore: offset + result.rows.length < total
                }
            });
        } catch (error) {
            console.error('搜索活动日志错误:', error);
            res.status(500).json({
                success: false,
                error: '搜索活动日志失败'
            });
        }
    }

    // 获取活动类型统计
    async getActivityTypeStats(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            const conditions: string[] = [];
            const params: any[] = [];
            let paramCount = 1;

            if (startDate) {
                conditions.push(`created_at >= $${paramCount}`);
                params.push(startDate);
                paramCount++;
            }

            if (endDate) {
                conditions.push(`created_at <= $${paramCount}`);
                params.push(endDate);
                paramCount++;
            }

            if (req.user.role !== 'admin') {
                conditions.push(`user_id = $${paramCount}`);
                params.push(req.user.id);
                paramCount++;
            }

            const whereClause = conditions.length > 0
                ? 'WHERE ' + conditions.join(' AND ')
                : '';

            const query = `
                SELECT 
                    activity_type,
                    COUNT(*) as count
                FROM activity_logs
                ${whereClause}
                GROUP BY activity_type
                ORDER BY count DESC
            `;

            const result = await pool.query(query, params);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取活动类型统计错误:', error);
            res.status(500).json({
                success: false,
                error: '获取活动类型统计失败'
            });
        }
    }
}

export default new ActivityLogController();