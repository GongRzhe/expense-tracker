// src/routes/statisticsRoutes.ts

import { Router } from 'express';
import statisticsController from '../controllers/statisticsController';

const router = Router();

// GET /api/statistics/overview - 获取支出总览
router.get('/overview', statisticsController.getOverview);

// GET /api/statistics/category - 按分类统计支出
router.get('/category', statisticsController.getCategoryStats);

// GET /api/statistics/monthly - 获取每月支出趋势
router.get('/monthly', statisticsController.getMonthlyTrend);

// GET /api/statistics/daily - 获取每日支出趋势
router.get('/daily', statisticsController.getDailyTrend);

// GET /api/statistics/high-expenses - 获取高额支出记录
router.get('/high-expenses', statisticsController.getHighExpenses);

export default router;