// src/app.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import expenseRoutes from './routes/expenseRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import exportRoutes from './routes/exportRoutes';
import userRoutes from './routes/userRoutes';
import activityLogRoutes from './routes/activityLogRoutes';
import userSettingsRoutes from './routes/userSettingsRoutes';

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityLogRoutes);
app.use('/api/users', userSettingsRoutes);

// 基础路由
app.get('/', (req, res) => {
    res.json({ 
        message: 'Expense Tracker API is running',
        version: '1.0.0',
        docs: '/api/docs'  // 如果添加了API文档
    });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 处理 404 错误
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '请求的资源不存在'
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问 http://localhost:${PORT} 查看 API 状态`);
});

export default app;