// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import pool from '../config/database';

// 扩展 Request 类型以包含用户信息
declare global {
    namespace Express {
        interface Request {
            user?: any;
            token?: string;
        }
    }
}

// 验证身份中间件
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // 从请求头获取令牌
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: '未授权访问'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: '令牌无效或已过期'
            });
        }

        // 检查会话是否有效
        const session = await pool.query(
            'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
            [token]
        );

        if (session.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: '会话已过期'
            });
        }

        // 获取用户信息
        const user = await pool.query(
            'SELECT id, username, email, role, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (user.rows.length === 0 || !user.rows[0].is_active) {
            return res.status(401).json({
                success: false,
                error: '用户不存在或已被禁用'
            });
        }

        // 将用户信息和令牌添加到请求对象
        req.user = user.rows[0];
        req.token = token;
        next();
    } catch (error) {
        console.error('认证错误:', error);
        res.status(500).json({
            success: false,
            error: '认证过程中发生错误'
        });
    }
};

// 检查角色中间件
export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: '未授权访问'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: '没有足够的权限'
            });
        }

        next();
    };
};

// 资源所有者验证中间件
export const checkOwnership = (resourceType: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: '未授权访问'
                });
            }

            const resourceId = req.params.id;
            let query = '';

            switch (resourceType) {
                case 'expense':
                    query = 'SELECT user_id FROM expenses WHERE id = $1';
                    break;
                case 'category':
                    query = 'SELECT user_id FROM expense_categories WHERE id = $1';
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: '无效的资源类型'
                    });
            }

            const result = await pool.query(query, [resourceId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '资源不存在'
                });
            }

            if (result.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: '没有权限访问此资源'
                });
            }

            next();
        } catch (error) {
            console.error('所有权验证错误:', error);
            res.status(500).json({
                success: false,
                error: '验证过程中发生错误'
            });
        }
    };
};