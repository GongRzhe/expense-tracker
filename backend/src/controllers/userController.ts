// src/controllers/userController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import { hashPassword, checkPasswordStrength, isValidEmail } from '../utils/auth';

export class UserController {
    // 获取用户列表（管理员）
    async getUsers(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            let query = `
                SELECT 
                    u.id, u.username, u.email, u.full_name, 
                    u.role, u.is_active, u.last_login,
                    u.city, u.country,
                    COUNT(e.id) as expense_count,
                    COALESCE(SUM(e.amount), 0) as total_expenses
                FROM users u
                LEFT JOIN expenses e ON u.id = e.user_id
            `;

            const params: any[] = [];
            
            if (search) {
                query += `
                    WHERE u.username ILIKE $1 
                    OR u.email ILIKE $1 
                    OR u.full_name ILIKE $1
                `;
                params.push(`%${search}%`);
            }

            query += `
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT $${params.length + 1} OFFSET $${params.length + 2}
            `;
            
            params.push(limit, offset);

            const result = await pool.query(query, params);
            const countResult = await pool.query('SELECT COUNT(*) FROM users');

            res.json({
                success: true,
                data: {
                    users: result.rows,
                    total: parseInt(countResult.rows[0].count),
                    page: Number(page),
                    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
                }
            });
        } catch (error) {
            console.error('获取用户列表错误:', error);
            res.status(500).json({
                success: false,
                error: '获取用户列表失败'
            });
        }
    }

    // 更新用户资料
    async updateProfile(req: Request, res: Response) {
        const client = await pool.connect();
        try {
            const userId = req.user.id;
            const {
                email,
                full_name,
                address,
                city,
                country,
                latitude,
                longitude,
                current_password,
                new_password
            } = req.body;

            await client.query('BEGIN');

            // 如果要更新邮箱，检查新邮箱是否已被使用
            if (email) {
                if (!isValidEmail(email)) {
                    return res.status(400).json({
                        success: false,
                        error: '邮箱格式无效'
                    });
                }

                const emailCheck = await client.query(
                    'SELECT id FROM users WHERE email = $1 AND id != $2',
                    [email, userId]
                );

                if (emailCheck.rows.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: '该邮箱已被使用'
                    });
                }
            }

            // 如果要更新密码
            if (new_password) {
                if (!current_password) {
                    return res.status(400).json({
                        success: false,
                        error: '请提供当前密码'
                    });
                }

                // 验证当前密码
                const userResult = await client.query(
                    'SELECT password_hash FROM users WHERE id = $1',
                    [userId]
                );

                const isPasswordValid = await bcrypt.compare(
                    current_password,
                    userResult.rows[0].password_hash
                );

                if (!isPasswordValid) {
                    return res.status(400).json({
                        success: false,
                        error: '当前密码错误'
                    });
                }

                // 检查新密码强度
                const passwordCheck = checkPasswordStrength(new_password);
                if (!passwordCheck.isStrong) {
                    return res.status(400).json({
                        success: false,
                        error: '新密码不够强：' + passwordCheck.errors.join('; ')
                    });
                }
            }

            // 构建更新查询
            const updates = [];
            const values = [];
            let paramCount = 1;

            if (email) {
                updates.push(`email = $${paramCount}`);
                values.push(email);
                paramCount++;
            }

            if (full_name) {
                updates.push(`full_name = $${paramCount}`);
                values.push(full_name);
                paramCount++;
            }

            if (address) {
                updates.push(`address = $${paramCount}`);
                values.push(address);
                paramCount++;
            }

            if (city) {
                updates.push(`city = $${paramCount}`);
                values.push(city);
                paramCount++;
            }

            if (country) {
                updates.push(`country = $${paramCount}`);
                values.push(country);
                paramCount++;
            }

            if (latitude) {
                updates.push(`latitude = $${paramCount}`);
                values.push(latitude);
                paramCount++;
            }

            if (longitude) {
                updates.push(`longitude = $${paramCount}`);
                values.push(longitude);
                paramCount++;
            }

            if (new_password) {
                const hashedPassword = await hashPassword(new_password);
                updates.push(`password_hash = $${paramCount}`);
                values.push(hashedPassword);
                paramCount++;
            }

            if (updates.length > 0) {
                values.push(userId);
                const query = `
                    UPDATE users 
                    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $${paramCount}
                    RETURNING id, username, email, full_name, address, city, country, latitude, longitude
                `;

                const result = await client.query(query, values);

                await client.query('COMMIT');

                res.json({
                    success: true,
                    data: result.rows[0],
                    message: '个人资料已更新'
                });
            } else {
                await client.query('ROLLBACK');
                res.status(400).json({
                    success: false,
                    error: '没有提供要更新的信息'
                });
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('更新用户资料错误:', error);
            res.status(500).json({
                success: false,
                error: '更新用户资料失败'
            });
        } finally {
            client.release();
        }
    }

    // 更新用户设置
    async updateSettings(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const { currency, language, theme, notification_enabled } = req.body;

            const result = await pool.query(
                `UPDATE user_settings 
                SET currency = COALESCE($1, currency),
                    language = COALESCE($2, language),
                    theme = COALESCE($3, theme),
                    notification_enabled = COALESCE($4, notification_enabled),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $5
                RETURNING *`,
                [currency, language, theme, notification_enabled, userId]
            );

            res.json({
                success: true,
                data: result.rows[0],
                message: '设置已更新'
            });
        } catch (error) {
            console.error('更新用户设置错误:', error);
            res.status(500).json({
                success: false,
                error: '更新用户设置失败'
            });
        }
    }

    // 管理员：更新用户状态
    async updateUserStatus(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { is_active } = req.body;

            // 检查用户是否存在
            const userCheck = await pool.query(
                'SELECT role FROM users WHERE id = $1',
                [userId]
            );

            if (userCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '用户不存在'
                });
            }

            // 不允许停用管理员账号
            if (userCheck.rows[0].role === 'admin' && !is_active) {
                return res.status(403).json({
                    success: false,
                    error: '不能停用管理员账号'
                });
            }

            const result = await pool.query(
                `UPDATE users 
                SET is_active = $1, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, username, is_active`,
                [is_active, userId]
            );

            res.json({
                success: true,
                data: result.rows[0],
                message: `用户已${is_active ? '启用' : '停用'}`
            });
        } catch (error) {
            console.error('更新用户状态错误:', error);
            res.status(500).json({
                success: false,
                error: '更新用户状态失败'
            });
        }
    }

    // 删除用户账号
    async deleteAccount(req: Request, res: Response) {
        const client = await pool.connect();
        try {
            const userId = req.user.id;

            await client.query('BEGIN');

            // 删除用户的所有数据
            await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM expenses WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM expense_categories WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM user_settings WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM users WHERE id = $1', [userId]);

            await client.query('COMMIT');

            res.json({
                success: true,
                message: '账号已删除'
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('删除账号错误:', error);
            res.status(500).json({
                success: false,
                error: '删除账号失败'
            });
        } finally {
            client.release();
        }
    }
}

export default new UserController();