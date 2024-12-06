// src/controllers/expenseController.ts

import { Request, Response } from 'express';
import pool from '../config/database';

class ExpenseController {
    // 获取支出列表
    async getExpenses(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, startDate, endDate, categoryId } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            // 构建查询条件
            const conditions = ['e.user_id = $1']; // 添加表别名 'e.'
            const params = [req.user.id];
            let paramCount = 2;

            if (startDate) {
                conditions.push(`e.date >= $${paramCount}`);
                params.push(startDate);
                paramCount++;
            }

            if (endDate) {
                conditions.push(`e.date <= $${paramCount}`);
                params.push(endDate);
                paramCount++;
            }

            if (categoryId) {
                conditions.push(`e.category_id = $${paramCount}`);
                params.push(categoryId);
                paramCount++;
            }

            // 计算总数
            const countQuery = `
                SELECT COUNT(*)
                FROM expenses e
                WHERE ${conditions.join(' AND ')}
            `;
            const countResult = await pool.query(countQuery, params);
            const total = parseInt(countResult.rows[0].count);

            // 获取分页数据
            const query = `
                SELECT 
                    e.*,
                    c.name as category_name
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                WHERE ${conditions.join(' AND ')}
                ORDER BY e.date DESC, e.created_at DESC
                LIMIT $${paramCount} OFFSET $${paramCount + 1}
            `;
            
            const result = await pool.query(
                query,
                [...params, limit, offset]
            );

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
            console.error('获取支出列表错误:', error);
            res.status(500).json({
                success: false,
                error: '获取支出列表失败'
            });
        }
    }

    // 获取单个支出记录
    async getExpenseById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await pool.query(
                `SELECT 
                    e.*,
                    c.name as category_name
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                WHERE e.id = $1 AND e.user_id = $2`,
                [id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '支出记录不存在或无权访问'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('获取支出详情错误:', error);
            res.status(500).json({
                success: false,
                error: '获取支出详情失败'
            });
        }
    }

    // 创建支出记录
    async createExpense(req: Request, res: Response) {
        try {
            const { description, amount, category_id, date } = req.body;

            // 输入验证
            if (!description || typeof description !== 'string' || description.trim().length === 0) {
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

            // 如果提供了分类ID，检查分类是否存在且属于当前用户
            if (category_id) {
                const categoryCheck = await pool.query(
                    'SELECT id FROM expense_categories WHERE id = $1 AND user_id = $2',
                    [category_id, req.user.id]
                );
                if (categoryCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: '选择的分类不存在或无权访问'
                    });
                }
            }

            const result = await pool.query(
                `INSERT INTO expenses (
                    description, 
                    amount, 
                    category_id, 
                    date, 
                    user_id
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [description, amount, category_id, date || new Date(), req.user.id]
            );

            // 获取带分类名称的完整数据
            const fullResult = await pool.query(
                `SELECT 
                    e.*,
                    c.name as category_name
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                WHERE e.id = $1`,
                [result.rows[0].id]
            );

            res.status(201).json({
                success: true,
                data: fullResult.rows[0]
            });
        } catch (error) {
            console.error('创建支出记录错误:', error);
            res.status(500).json({
                success: false,
                error: '创建支出记录失败'
            });
        }
    }

    // 更新支出记录
    async updateExpense(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { description, amount, category_id, date } = req.body;

            // 检查记录是否存在且属于当前用户
            const checkResult = await pool.query(
                'SELECT id FROM expenses WHERE id = $1 AND user_id = $2',
                [id, req.user.id]
            );

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '支出记录不存在或无权访问'
                });
            }

            // 构建更新语句
            const updates = [];
            const values = [];
            let paramCount = 1;

            if (description !== undefined) {
                if (typeof description !== 'string' || description.trim().length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: '描述不能为空'
                    });
                }
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
                if (category_id !== null) {
                    const categoryCheck = await pool.query(
                        'SELECT id FROM expense_categories WHERE id = $1 AND user_id = $2',
                        [category_id, req.user.id]
                    );
                    if (categoryCheck.rows.length === 0) {
                        return res.status(400).json({
                            success: false,
                            error: '选择的分类不存在或无权访问'
                        });
                    }
                }
                updates.push(`category_id = $${paramCount}`);
                values.push(category_id);
                paramCount++;
            }

            if (date !== undefined) {
                updates.push(`date = $${paramCount}`);
                values.push(date);
                paramCount++;
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '没有提供要更新的字段'
                });
            }

            values.push(id, req.user.id);
            const query = `
                UPDATE expenses 
                SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
                RETURNING *
            `;

            const result = await pool.query(query, values);

            // 获取带分类名称的完整数据
            const fullResult = await pool.query(
                `SELECT 
                    e.*,
                    c.name as category_name
                FROM expenses e
                LEFT JOIN expense_categories c ON e.category_id = c.id
                WHERE e.id = $1`,
                [id]
            );

            res.json({
                success: true,
                data: fullResult.rows[0]
            });
        } catch (error) {
            console.error('更新支出记录错误:', error);
            res.status(500).json({
                success: false,
                error: '更新支出记录失败'
            });
        }
    }

    // 删除支出记录
    async deleteExpense(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '支出记录不存在或无权访问'
                });
            }

            res.json({
                success: true,
                message: '支出记录已删除'
            });
        } catch (error) {
            console.error('删除支出记录错误:', error);
            res.status(500).json({
                success: false,
                error: '删除支出记录失败'
            });
        }
    }
}

export default new ExpenseController();