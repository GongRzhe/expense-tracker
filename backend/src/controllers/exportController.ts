// src/controllers/exportController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import { ApiResponse } from '../types';

export class ExportController {
    // 导出CSV格式的支出数据
    async exportToCSV(req: Request, res: Response) {
        try {
            const { startDate, endDate, categoryId } = req.query;
            const conditions: string[] = [];
            const params: any[] = [];

            if (startDate) {
                params.push(startDate);
                conditions.push(`expenses.date >= $${params.length}`);
            }
            if (endDate) {
                params.push(endDate);
                conditions.push(`expenses.date <= $${params.length}`);
            }
            if (categoryId) {
                params.push(categoryId);
                conditions.push(`expenses.category_id = $${params.length}`);
            }

            const whereClause = conditions.length > 0 
                ? `WHERE ${conditions.join(' AND ')}` 
                : '';

            const query = `
                SELECT 
                    expenses.date,
                    expenses.description,
                    expenses.amount,
                    expense_categories.name as category_name,
                    expenses.created_at
                FROM expenses
                LEFT JOIN expense_categories ON expenses.category_id = expense_categories.id
                ${whereClause}
                ORDER BY expenses.date DESC, expenses.created_at DESC
            `;

            const result = await pool.query(query, params);

            // 生成CSV内容
            const csvHeader = 'Date,Description,Amount,Category,Created At\n';
            const csvRows = result.rows.map(row => {
                const description = row.description.replace(/"/g, '""'); // 处理描述中的引号
                return `${row.date},${description},${row.amount},${row.category_name || 'Uncategorized'},${row.created_at}`;
            });
            const csvContent = csvHeader + csvRows.join('\n');

            // 设置响应头
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');

            // 发送CSV数据
            res.send(csvContent);

        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '导出数据失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }

    // 导出JSON格式的支出数据
    async exportToJSON(req: Request, res: Response) {
        try {
            const { startDate, endDate, categoryId } = req.query;
            const conditions: string[] = [];
            const params: any[] = [];

            if (startDate) {
                params.push(startDate);
                conditions.push(`expenses.date >= $${params.length}`);
            }
            if (endDate) {
                params.push(endDate);
                conditions.push(`expenses.date <= $${params.length}`);
            }
            if (categoryId) {
                params.push(categoryId);
                conditions.push(`expenses.category_id = $${params.length}`);
            }

            const whereClause = conditions.length > 0 
                ? `WHERE ${conditions.join(' AND ')}` 
                : '';

            const query = `
                SELECT 
                    expenses.date,
                    expenses.description,
                    expenses.amount,
                    expense_categories.name as category_name,
                    expenses.created_at
                FROM expenses
                LEFT JOIN expense_categories ON expenses.category_id = expense_categories.id
                ${whereClause}
                ORDER BY expenses.date DESC, expenses.created_at DESC
            `;

            const result = await pool.query(query, params);

            // 添加导出信息
            const exportData = {
                exportDate: new Date().toISOString(),
                totalRecords: result.rows.length,
                totalAmount: result.rows.reduce((sum: number, row: any) => sum + parseFloat(row.amount), 0),
                filters: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                    categoryId: categoryId || null
                },
                expenses: result.rows
            };

            // 设置响应头
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=expenses.json');

            // 发送JSON数据
            res.json(exportData);

        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '导出数据失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }

    // 获取导出数据的概要信息
    async getExportSummary(req: Request, res: Response) {
        try {
            const { startDate, endDate, categoryId } = req.query;
            const conditions: string[] = [];
            const params: any[] = [];

            if (startDate) {
                params.push(startDate);
                conditions.push(`expenses.date >= $${params.length}`);
            }
            if (endDate) {
                params.push(endDate);
                conditions.push(`expenses.date <= $${params.length}`);
            }
            if (categoryId) {
                params.push(categoryId);
                conditions.push(`expenses.category_id = $${params.length}`);
            }

            const whereClause = conditions.length > 0 
                ? `WHERE ${conditions.join(' AND ')}` 
                : '';

            const query = `
                SELECT 
                    COUNT(*) as total_records,
                    SUM(expenses.amount) as total_amount,
                    MIN(expenses.date) as earliest_date,
                    MAX(expenses.date) as latest_date,
                    COUNT(DISTINCT expenses.category_id) as category_count
                FROM expenses
                ${whereClause}
            `;

            const result = await pool.query(query, params);

            const response: ApiResponse<any> = {
                success: true,
                data: result.rows[0]
            };
            
            res.json(response);

        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取导出概要失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }
}

export default new ExportController();