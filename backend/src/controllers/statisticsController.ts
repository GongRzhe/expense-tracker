// src/controllers/statisticsController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import { ApiResponse } from '../types';

export class StatisticsController {
    // 获取支出总览
    async getOverview(req: Request, res: Response) {
        try {
            const userId = req.user.id;

            // 使用子查询获取各项统计数据
            const result = await pool.query(`
                WITH stats AS (
                    SELECT 
                        COALESCE(SUM(amount), 0) as total_amount,
                        COALESCE(AVG(amount), 0) as average_amount,
                        COALESCE(MAX(amount), 0) as max_amount,
                        COALESCE(MIN(CASE WHEN amount > 0 THEN amount END), 0) as min_amount,
                        COUNT(*) as total_count
                    FROM expenses
                    WHERE user_id = $1
                        AND date >= CURRENT_DATE - INTERVAL '30 days'
                )
                SELECT 
                    total_amount,
                    ROUND(average_amount::numeric, 2) as average_amount,
                    max_amount,
                    min_amount,
                    total_count,
                    (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM expenses
                        WHERE user_id = $1
                            AND date = CURRENT_DATE
                    ) as today_amount,
                    (
                        SELECT COUNT(*)
                        FROM expenses
                        WHERE user_id = $1
                            AND date = CURRENT_DATE
                    ) as today_count
                FROM stats
            `, [userId]);

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('获取支出总览错误:', error);
            res.status(500).json({
                success: false,
                error: '获取支出总览失败'
            });
        }
    }

    // 按分类统计支出
    async getCategoryStats(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            let dateFilter = '';
            const params: any[] = [];

            if (startDate && endDate) {
                dateFilter = 'WHERE e.date BETWEEN $1 AND $2';
                params.push(startDate, endDate);
            }

            const result = await pool.query(`
                SELECT 
                    c.name as category_name,
                    COUNT(*) as record_count,
                    SUM(e.amount) as total_amount,
                    AVG(e.amount) as average_amount
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                ${dateFilter}
                GROUP BY c.id, c.name
                ORDER BY total_amount DESC
            `, params);

            const response: ApiResponse<any> = {
                success: true,
                data: result.rows
            };

            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取分类统计失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }

    // 获取每月支出趋势
    async getMonthlyTrend(req: Request, res: Response) {
        try {
            const result = await pool.query(`
                SELECT 
                    DATE_TRUNC('month', date) as month,
                    COUNT(*) as record_count,
                    SUM(amount) as total_amount,
                    AVG(amount) as average_amount
                FROM expenses
                WHERE date >= CURRENT_DATE - INTERVAL '12 months'
                GROUP BY DATE_TRUNC('month', date)
                ORDER BY month DESC
            `);

            const response: ApiResponse<any> = {
                success: true,
                data: result.rows
            };

            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取月度趋势失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }

    // 获取每日支出趋势
    async getDailyTrend(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const days = parseInt(req.query.days as string) || 30;

            const result = await pool.query(`
                WITH RECURSIVE dates AS (
                    SELECT CURRENT_DATE - INTERVAL '${days - 1} days' as date
                    UNION ALL
                    SELECT date + 1
                    FROM dates
                    WHERE date < CURRENT_DATE
                ),
                daily_stats AS (
                    SELECT 
                        date::date,
                        COALESCE(SUM(amount), 0) as total_amount,
                        COALESCE(AVG(amount), 0) as average_amount,
                        COUNT(*) as record_count
                    FROM expenses
                    WHERE user_id = $1
                        AND date >= CURRENT_DATE - INTERVAL '${days - 1} days'
                    GROUP BY date::date
                )
                SELECT 
                    d.date,
                    COALESCE(s.total_amount, 0) as total_amount,
                    ROUND(COALESCE(s.average_amount, 0)::numeric, 2) as average_amount,
                    COALESCE(s.record_count, 0) as record_count
                FROM dates d
                LEFT JOIN daily_stats s ON d.date = s.date
                ORDER BY d.date
            `, [userId]);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取每日支出趋势错误:', error);
            res.status(500).json({
                success: false,
                error: '获取每日支出趋势失败'
            });
        }
    }

    // 获取高额支出记录
    async getHighExpenses(req: Request, res: Response) {
        try {
            const { limit = 10 } = req.query;

            const result = await pool.query(`
                SELECT 
                    e.*,
                    c.name as category_name
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                ORDER BY e.amount DESC
                LIMIT $1
            `, [limit]);

            const response: ApiResponse<any> = {
                success: true,
                data: result.rows
            };

            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取高额支出记录失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }
}

export default new StatisticsController();