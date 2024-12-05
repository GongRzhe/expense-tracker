// src/controllers/authController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import {
    hashPassword,
    verifyPassword,
    generateToken,
    checkPasswordStrength,
    loginAttemptTracker,
    isValidEmail,
    isValidUsername,
    parseUserAgent
} from '../utils/auth';
import activityLogService from '../services/activityLogService';

export class AuthController {
    // 用户注册
    async register(req: Request, res: Response) {
        const client = await pool.connect();
        try {
            const {
                username,
                email,
                password,
                password_confirm,
                full_name,
                address,
                city,
                country,
                latitude,
                longitude
            } = req.body;

            // 基本验证
            if (!username || !email || !password || !password_confirm) {
                return res.status(400).json({
                    success: false,
                    error: '所有必填字段都必须填写'
                });
            }

            // 密码确认
            if (password !== password_confirm) {
                return res.status(400).json({
                    success: false,
                    error: '两次输入的密码不匹配'
                });
            }

            // 验证用户名格式
            if (!isValidUsername(username)) {
                return res.status(400).json({
                    success: false,
                    error: '用户名必须是4-20个字符，只能包含字母、数字、下划线和连字符'
                });
            }

            // 验证邮箱格式
            if (!isValidEmail(email)) {
                return res.status(400).json({
                    success: false,
                    error: '邮箱格式无效'
                });
            }

            // 检查密码强度
            const passwordCheck = checkPasswordStrength(password);
            if (!passwordCheck.isStrong) {
                return res.status(400).json({
                    success: false,
                    error: '密码不够强：' + passwordCheck.errors.join('; ')
                });
            }

            // 开始事务
            await client.query('BEGIN');

            // 检查用户名和邮箱是否已存在
            const existingUser = await client.query(
                'SELECT username, email FROM users WHERE username = $1 OR email = $2',
                [username, email]
            );

            if (existingUser.rows.length > 0) {
                const field = existingUser.rows[0].username === username ? '用户名' : '邮箱';
                return res.status(400).json({
                    success: false,
                    error: `该${field}已被注册`
                });
            }

            // 加密密码
            const hashedPassword = await hashPassword(password);

            // 创建用户
            const userResult = await client.query(
                `INSERT INTO users (
                    username, email, password_hash, full_name, 
                    address, city, country, latitude, longitude
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING id, username, email, role`,
                [
                    username, email, hashedPassword, full_name,
                    address, city, country, latitude, longitude
                ]
            );

            // 创建用户设置
            await client.query(
                'INSERT INTO user_settings (user_id) VALUES ($1)',
                [userResult.rows[0].id]
            );

            // 提交事务
            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                data: userResult.rows[0],
                message: '注册成功'
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('注册错误:', error);
            res.status(500).json({
                success: false,
                error: '注册过程中发生错误'
            });
        } finally {
            client.release();
        }
    }

    // 用户登录
    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            // 检查登录尝试次数
            if (!loginAttemptTracker.recordAttempt(username)) {
                return res.status(429).json({
                    success: false,
                    error: '登录尝试次数过多，请稍后再试'
                });
            }

            // 查找用户
            const userResult = await pool.query(
                'SELECT * FROM users WHERE username = $1 OR email = $1',
                [username]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: '用户名或密码错误'
                });
            }

            const user = userResult.rows[0];

            // 验证密码
            const isValid = await verifyPassword(password, user.password_hash);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: '用户名或密码错误'
                });
            }

            // 检查用户状态
            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    error: '账户已被禁用'
                });
            }

            // 生成令牌
            const { token, expires_at } = generateToken(user);

            // 获取设备信息
            const deviceInfo = parseUserAgent(req.headers['user-agent'] || '');

            // 创建会话记录
            await pool.query(
                `INSERT INTO sessions (
                    user_id, token, device_info, ip_address, expires_at
                ) VALUES ($1, $2, $3, $4, $5)`,
                [user.id, token, deviceInfo, req.ip, expires_at]
            );

            // 更新最后登录时间
            await pool.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );

            // 获取用户设置
            const settingsResult = await pool.query(
                'SELECT * FROM user_settings WHERE user_id = $1',
                [user.id]
            );

            // 清除登录尝试记录
            loginAttemptTracker.clearAttempts(username);
            // 在 login 方法中成功登录后添加：
            await activityLogService.logActivity({
                userId: user.id,
                type: 'login',
                description: '用户登录成功',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    deviceInfo,
                    loginTime: new Date().toISOString()
                }
            });

            // 返回用户信息和令牌
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role
                    },
                    settings: settingsResult.rows[0],
                    token,
                    expires_at
                }
            });

        } catch (error) {
            console.error('登录错误:', error);
            res.status(500).json({
                success: false,
                error: '登录过程中发生错误'
            });
        }
    }

    // 退出登录
    async logout(req: Request, res: Response) {
        try {
            const token = req.token;
            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: '未提供有效的令牌'
                });
            }

            // 删除会话
            await pool.query(
                'DELETE FROM sessions WHERE token = $1',
                [token]
            );
            await activityLogService.logActivity({
                userId: req.user.id,
                type: 'logout',
                description: '用户退出登录',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            res.json({
                success: true,
                message: '已成功退出登录'
            });

        } catch (error) {
            console.error('退出登录错误:', error);
            res.status(500).json({
                success: false,
                error: '退出登录过程中发生错误'
            });
        }
    }

    // 获取当前用户信息
    async getCurrentUser(req: Request, res: Response) {
        try {
            const userId = req.user.id;

            const userResult = await pool.query(
                `SELECT id, username, email, full_name, role, is_active,
                address, city, country, latitude, longitude,
                last_login, created_at, updated_at
                FROM users WHERE id = $1`,
                [userId]
            );

            const settingsResult = await pool.query(
                'SELECT * FROM user_settings WHERE user_id = $1',
                [userId]
            );

            res.json({
                success: true,
                data: {
                    user: userResult.rows[0],
                    settings: settingsResult.rows[0]
                }
            });

        } catch (error) {
            console.error('获取用户信息错误:', error);
            res.status(500).json({
                success: false,
                error: '获取用户信息过程中发生错误'
            });
        }
    }


    // src/controllers/userController.ts 中添加 updateProfile 方法

    // 更新个人资料
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

                const isPasswordValid = await verifyPassword(
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
            const updates: string[] = [];
            const values: any[] = [];
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

                // 记录活动日志
                await activityLogService.logActivity({
                    userId: userId,
                    type: 'profile_update',
                    description: '更新个人资料',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    metadata: {
                        updatedFields: Object.keys(req.body).filter(field => field !== 'current_password'),
                        hasPasswordChange: !!new_password
                    }
                });

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
}

export default new AuthController();