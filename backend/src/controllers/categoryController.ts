// src/controllers/categoryController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import { ExpenseCategory, ApiResponse } from '../types';
import activityLogService from '../services/activityLogService';
export class CategoryController {
    // 获取所有支出分类
    async getAllCategories(req: Request, res: Response) {
        try {
            const result = await pool.query<ExpenseCategory>(
                'SELECT * FROM expense_categories ORDER BY name'
            );
            
            const response: ApiResponse<ExpenseCategory[]> = {
                success: true,
                data: result.rows
            };
            
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取支出分类失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            
            res.status(500).json(response);
        }
    }

    // 获取单个支出分类
    async getCategoryById(req: Request, res: Response) {
        const { id } = req.params;
        
        try {
            const result = await pool.query<ExpenseCategory>(
                'SELECT * FROM expense_categories WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '支出分类不存在'
                };
                return res.status(404).json(response);
            }

            const response: ApiResponse<ExpenseCategory> = {
                success: true,
                data: result.rows[0]
            };
            
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '获取支出分类失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            
            res.status(500).json(response);
        }
    }

    // 创建新的支出分类
    async createCategory(req: Request, res: Response) {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            const response: ApiResponse<null> = {
                success: false,
                error: '分类名称不能为空'
            };
            return res.status(400).json(response);
        }

        try {
            const result = await pool.query<ExpenseCategory>(
                'INSERT INTO expense_categories (name) VALUES ($1) RETURNING *',
                [name.trim()]
            );

            const response: ApiResponse<ExpenseCategory> = {
                success: true,
                data: result.rows[0],
                message: '支出分类创建成功'
            };
            await activityLogService.logActivity({
                userId: req.user.id,
                type: 'category_create',
                description: `创建支出分类: ${name}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    categoryId: result.rows[0].id,
                    categoryName: name
                }
            });
            
            res.status(201).json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '创建支出分类失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            
            res.status(500).json(response);
        }
    }

    // 更新支出分类
    async updateCategory(req: Request, res: Response) {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            const response: ApiResponse<null> = {
                success: false,
                error: '分类名称不能为空'
            };
            return res.status(400).json(response);
        }

        try {
            const result = await pool.query<ExpenseCategory>(
                'UPDATE expense_categories SET name = $1 WHERE id = $2 RETURNING *',
                [name.trim(), id]
            );

            if (result.rows.length === 0) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '支出分类不存在'
                };
                return res.status(404).json(response);
            }

            const response: ApiResponse<ExpenseCategory> = {
                success: true,
                data: result.rows[0],
                message: '支出分类更新成功'
            };
            await activityLogService.logActivity({
                userId: req.user.id,
                type: 'category_update',
                description: `更新支出分类 #${id}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    categoryId: id,
                    oldName: category.rows[0].name,
                    newName: name
                }
            });
            
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '更新支出分类失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            
            res.status(500).json(response);
        }
    }

    // 删除支出分类
    async deleteCategory(req: Request, res: Response) {
        const { id } = req.params;

        try {
            // 检查是否有支出记录使用了该分类
            const checkResult = await pool.query(
                'SELECT COUNT(*) FROM expenses WHERE category_id = $1',
                [id]
            );

            if (parseInt(checkResult.rows[0].count) > 0) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '该分类下存在支出记录，无法删除'
                };
                return res.status(400).json(response);
            }

            const result = await pool.query<ExpenseCategory>(
                'DELETE FROM expense_categories WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '支出分类不存在'
                };
                return res.status(404).json(response);
            }

            const response: ApiResponse<ExpenseCategory> = {
                success: true,
                data: result.rows[0],
                message: '支出分类删除成功'
            };
            await activityLogService.logActivity({
                userId: req.user.id,
                type: 'category_delete',
                description: `删除支出分类 #${id}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    categoryId: id,
                    categoryData: result.rows[0]
                }
            });
            res.json(response);
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: '删除支出分类失败',
                message: error instanceof Error ? error.message : '未知错误'
            };
            
            res.status(500).json(response);
        }
    }
}

export default new CategoryController();