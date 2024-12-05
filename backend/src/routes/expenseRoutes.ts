// src/routes/expenseRoutes.ts

import { Router } from 'express';
import expenseController from '../controllers/expenseController';

const router = Router();

// GET /api/expenses - 获取支出列表（带分页和筛选）
router.get('/', expenseController.getExpenses);

// GET /api/expenses/:id - 获取单个支出记录
router.get('/:id', expenseController.getExpenseById);

// POST /api/expenses - 创建新支出记录
router.post('/', expenseController.createExpense);

// PUT /api/expenses/:id - 更新支出记录
router.put('/:id', expenseController.updateExpense);

// DELETE /api/expenses/:id - 删除支出记录
router.delete('/:id', expenseController.deleteExpense);

export default router;