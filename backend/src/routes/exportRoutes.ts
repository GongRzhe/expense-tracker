// src/routes/exportRoutes.ts

import { Router } from 'express';
import exportController from '../controllers/exportController';

const router = Router();

// GET /api/export/csv - 导出CSV格式的支出数据
router.get('/csv', exportController.exportToCSV);

// GET /api/export/json - 导出JSON格式的支出数据
router.get('/json', exportController.exportToJSON);

// GET /api/export/summary - 获取导出数据的概要信息
router.get('/summary', exportController.getExportSummary);

export default router;