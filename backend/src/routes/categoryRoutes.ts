// src/routes/categoryRoutes.ts

import { Router } from 'express';
import categoryController from '../controllers/categoryController';
import { authenticate, checkRole, checkOwnership } from '../middleware/auth';

const router = Router();

// 应用认证中间件
router.use(authenticate);

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