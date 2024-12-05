// src/controllers/statisticsController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import { ApiResponse } from '../types';

export class StatisticsController {
    // 获取支出总览
    async getOverview(req: Request, res: Response) {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_records,
                    SUM(amount) as total_amount,
                    AVG(amount) as average_amount,
                    MIN(amount) as min_amount,
                    MAX(amount) as max_amount
                FROM expenses
                WHERE date >= CURRENT_DATE - INTERVAL '30 days'
            `);

            const response: ApiResponse<any> = {
                success: true,
                data: result.rows[0]
            };
            
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取支出总览失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
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
            const { days = 30 } = req.query;
            
            const result = await pool.query(`
                SELECT 
                    date,
                    COUNT(*) as record_count,
                    SUM(amount) as total_amount
                FROM expenses
                WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
                GROUP BY date
                ORDER BY date DESC
            `);

            const response: ApiResponse<any> = {
                success: true,
                data: result.rows
            };
            
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取日支出趋势失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
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