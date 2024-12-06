// src/routes/expenseRoutes.ts

import { Router } from 'express';
import { authenticate, checkRole, checkOwnership } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

// 应用认证中间件
router.use(authenticate);

class ExpenseController {
    // 获取支出列表
    async getExpenses(req: any, res: any) {
        try {
            const { page = 1, limit = 10, startDate, endDate, categoryId } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            // 构建查询条件
            const conditions = ['e.user_id = $1'];
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
            
            const result = await pool.query(query, [...params, limit, offset]);

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
    async getExpenseById(req: any, res: any) {
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
                    error: '支出记录不存在'
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
    async createExpense(req: any, res: any) {
        try {
            const { description, amount, category_id, date } = req.body;

            // 添加到数据库
            const result = await pool.query(
                `INSERT INTO expenses (
                    description, amount, category_id, date, user_id
                ) VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [description, amount, category_id, date || new Date(), req.user.id]
            );

            res.status(201).json({
                success: true,
                data: result.rows[0]
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
    async updateExpense(req: any, res: any) {
        try {
            const { id } = req.params;
            const { description, amount, category_id, date } = req.body;

            const result = await pool.query(
                `UPDATE expenses 
                SET 
                    description = COALESCE($1, description),
                    amount = COALESCE($2, amount),
                    category_id = COALESCE($3, category_id),
                    date = COALESCE($4, date),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $5 AND user_id = $6
                RETURNING *`,
                [description, amount, category_id, date, id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '支出记录不存在'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
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
    async deleteExpense(req: any, res: any) {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '支出记录不存在'
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

const expenseController = new ExpenseController();

// 获取支出列表和创建新支出
router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);

// 需要所有权验证的路由
router.get('/:id', checkOwnership('expense'), expenseController.getExpenseById);
router.put('/:id', checkOwnership('expense'), expenseController.updateExpense);
router.delete('/:id', checkOwnership('expense'), expenseController.deleteExpense);

export default router;