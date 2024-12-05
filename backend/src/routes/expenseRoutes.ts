// src/routes/expenseRoutes.ts

import { Router } from 'express';
import expenseController from '../controllers/expenseController';
import { authenticate, checkRole, checkOwnership } from '../middleware/auth';

const router = Router();

// 应用认证中间件
router.use(authenticate);

// 获取支出列表和创建新支出
router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);

// 需要所有权验证的路由
router.get('/:id', checkOwnership('expense'), expenseController.getExpenseById);
router.put('/:id', checkOwnership('expense'), expenseController.updateExpense);
router.delete('/:id', checkOwnership('expense'), expenseController.deleteExpense);

// 管理员特权路由
router.get('/all/admin', checkRole(['admin']), expenseController.getAllExpenses);

export default router;