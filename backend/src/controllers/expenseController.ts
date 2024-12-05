// src/controllers/expenseController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import { Expense, ApiResponse, PaginationQuery, PaginatedResponse } from '../types';

export class ExpenseController {
    // 获取支出列表（带分页和筛选）
    async getExpenses(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit = 10,
                startDate,
                endDate,
                categoryId
            } = req.query as unknown as PaginationQuery;

            // 构建查询条件
            let queryParams: any[] = [];
            let conditions: string[] = [];

            if (startDate) {
                queryParams.push(startDate);
                conditions.push(`date >= $${queryParams.length}`);
            }

            if (endDate) {
                queryParams.push(endDate);
                conditions.push(`date <= $${queryParams.length}`);
            }

            if (categoryId) {
                queryParams.push(categoryId);
                conditions.push(`category_id = $${queryParams.length}`);
            }

            const whereClause = conditions.length > 0 
                ? `WHERE ${conditions.join(' AND ')}` 
                : '';

            // 计算总记录数
            const countQuery = `
                SELECT COUNT(*) 
                FROM expenses 
                ${whereClause}
            `;
            const totalResult = await pool.query(countQuery, queryParams);
            const total = parseInt(totalResult.rows[0].count);

            // 获取分页数据
            const offset = (page - 1) * limit;
            const query = `
                SELECT e.*, c.name as category_name
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                ${whereClause}
                ORDER BY e.date DESC
                LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
            `;
            
            queryParams.push(limit, offset);
            const result = await pool.query(query, queryParams);

            const response: ApiResponse<PaginatedResponse<Expense>> = {
                success: true,
                data: {
                    items: result.rows,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    hasMore: offset + result.rows.length < total
                }
            };

            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取支出记录失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }

    // 获取单个支出记录
    async getExpenseById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const query = `
                SELECT e.*, c.name as category_name
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                WHERE e.id = $1
            `;
            const result = await pool.query<Expense>(query, [id]);

            if (result.rows.length === 0) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '支出记录不存在'
                };
                return res.status(404).json(response);
            }

            const response: ApiResponse<Expense> = {
                success: true,
                data: result.rows[0]
            };
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取支出记录失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }

    // 创建支出记录
    async createExpense(req: Request, res: Response) {
        const { description, amount, category_id, date } = req.body;

        try {
            // 输入验证
            if (!description || description.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '描述不能为空'
                });
            }

            if (!amount || isNaN(amount) || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: '金额必须大于0'
                });
            }

            // 检查分类是否存在
            if (category_id) {
                const categoryCheck = await pool.query(
                    'SELECT id FROM expense_categories WHERE id = $1',
                    [category_id]
                );
                if (categoryCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: '选择的分类不存在'
                    });
                }
            }

            const result = await pool.query<Expense>(
                `INSERT INTO expenses (description, amount, category_id, date) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`,
                [description, amount, category_id, date || new Date()]
            );

            const response: ApiResponse<Expense> = {
                success: true,
                data: result.rows[0],
                message: '支出记录创建成功'
            };
            res.status(201).json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '创建支出记录失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }

    // 更新支出记录
    async updateExpense(req: Request, res: Response) {
        const { id } = req.params;
        const { description, amount, category_id, date } = req.body;

        try {
            // 检查记录是否存在
            const checkResult = await pool.query(
                'SELECT id FROM expenses WHERE id = $1',
                [id]
            );

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '支出记录不存在'
                });
            }

            // 构建更新语句
            const updates: string[] = [];
            const values: any[] = [];
            let paramCount = 1;

            if (description !== undefined) {
                updates.push(`description = $${paramCount}`);
                values.push(description);
                paramCount++;
            }

            if (amount !== undefined) {
                if (isNaN(amount) || amount <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: '金额必须大于0'
                    });
                }
                updates.push(`amount = $${paramCount}`);
                values.push(amount);
                paramCount++;
            }

            if (category_id !== undefined) {
                updates.push(`category_id = $${paramCount}`);
                values.push(category_id);
                paramCount++;
            }

            if (date !== undefined) {
                updates.push(`date = $${paramCount}`);
                values.push(date);
                paramCount++;
            }

            // 添加更新时间
            updates.push(`updated_at = CURRENT_TIMESTAMP`);

            values.push(id);
            const query = `
                UPDATE expenses 
                SET ${updates.join(', ')} 
                WHERE id = $${paramCount} 
                RETURNING *
            `;

            const result = await pool.query<Expense>(query, values);

            const response: ApiResponse<Expense> = {
                success: true,
                data: result.rows[0],
                message: '支出记录更新成功'
            };
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '更新支出记录失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }

    // 删除支出记录
    async deleteExpense(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const result = await pool.query<Expense>(
                'DELETE FROM expenses WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '支出记录不存在'
                };
                return res.status(404).json(response);
            }

            const response: ApiResponse<Expense> = {
                success: true,
                data: result.rows[0],
                message: '支出记录删除成功'
            };
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '删除支出记录失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            res.status(500).json(response);
        }
    }
}

export default new ExpenseController();