// src/routes/categoryRoutes.ts

import { Router } from 'express';
import { authenticate, checkRole, checkOwnership } from '../middleware/auth';
import pool from '../config/database'; // 添加这行

const router = Router();

// 应用认证中间件
router.use(authenticate);

class CategoryController {
    // 获取所有分类
    async getAllCategories(req: any, res: any) {
        try {
            const result = await pool.query(
                'SELECT * FROM expense_categories WHERE user_id = $1 ORDER BY name',
                [req.user.id]
            );
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取分类列表错误:', error);
            res.status(500).json({
                success: false,
                error: '获取分类列表失败'
            });
        }
    }

    // 获取单个分类
    async getCategoryById(req: any, res: any) {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'SELECT * FROM expense_categories WHERE id = $1 AND user_id = $2',
                [id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '分类不存在'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('获取分类详情错误:', error);
            res.status(500).json({
                success: false,
                error: '获取分类详情失败'
            });
        }
    }

    // 创建分类
    async createCategory(req: any, res: any) {
        try {
            const { name } = req.body;
            
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '分类名称不能为空'
                });
            }

            const result = await pool.query(
                'INSERT INTO expense_categories (name, user_id) VALUES ($1, $2) RETURNING *',
                [name.trim(), req.user.id]
            );

            res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('创建分类错误:', error);
            res.status(500).json({
                success: false,
                error: '创建分类失败'
            });
        }
    }

    // 更新分类
    async updateCategory(req: any, res: any) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '分类名称不能为空'
                });
            }

            const result = await pool.query(
                'UPDATE expense_categories SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
                [name.trim(), id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '分类不存在'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('更新分类错误:', error);
            res.status(500).json({
                success: false,
                error: '更新分类失败'
            });
        }
    }

    // 删除分类
    async deleteCategory(req: any, res: any) {
        try {
            const { id } = req.params;

            // 检查是否有支出记录使用了该分类
            const checkResult = await pool.query(
                'SELECT COUNT(*) FROM expenses WHERE category_id = $1',
                [id]
            );

            if (parseInt(checkResult.rows[0].count) > 0) {
                return res.status(400).json({
                    success: false,
                    error: '该分类下存在支出记录，无法删除'
                });
            }

            const result = await pool.query(
                'DELETE FROM expense_categories WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '分类不存在'
                });
            }

            res.json({
                success: true,
                message: '分类已删除'
            });
        } catch (error) {
            console.error('删除分类错误:', error);
            res.status(500).json({
                success: false,
                error: '删除分类失败'
            });
        }
    }

    // 管理员：获取所有分类
    async getAllCategoriesAdmin(req: any, res: any) {
        try {
            const result = await pool.query(
                'SELECT c.*, u.username FROM expense_categories c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC'
            );
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('获取所有分类错误:', error);
            res.status(500).json({
                success: false,
                error: '获取所有分类失败'
            });
        }
    }
}

const categoryController = new CategoryController();

// 获取分类列表和创建新分类
router.get('/', categoryController.getAllCategories);
router.post('/', categoryController.createCategory);

// 需要所有权验证的路由
router.get('/:id', checkOwnership('category'), categoryController.getCategoryById);
router.put('/:id', checkOwnership('category'), categoryController.updateCategory);
router.delete('/:id', checkOwnership('category'), categoryController.deleteCategory);

// 管理员特权路由
router.get('/all/admin', checkRole(['admin']), categoryController.getAllCategoriesAdmin);

export default router;