// src/controllers/userSettingsController.ts

import { Request, Response } from 'express';
import pool from '../config/database';
import activityLogService from '../services/activityLogService';

class UserSettingsController {
    // 获取用户设置
    async getUserSettings(req: Request, res: Response) {
        try {
            const result = await pool.query(
                'SELECT * FROM user_settings WHERE user_id = $1',
                [req.user.id]
            );

            if (result.rows.length === 0) {
                // 如果没有设置记录，创建默认设置
                const defaultSettings = await pool.query(
                    `INSERT INTO user_settings (
                        user_id, 
                        currency, 
                        language, 
                        theme,
                        notification_enabled
                    ) VALUES ($1, $2, $3, $4, $5) 
                    RETURNING *`,
                    [req.user.id, 'CNY', 'zh-CN', 'light', true]
                );

                return res.json({
                    success: true,
                    data: defaultSettings.rows[0]
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('获取用户设置错误:', error);
            res.status(500).json({
                success: false,
                error: '获取用户设置失败'
            });
        }
    }

    // 更新用户设置
    async updateUserSettings(req: Request, res: Response) {
        const client = await pool.connect();
        try {
            const { currency, language, theme, notification_enabled } = req.body;

            // 验证货币设置
            const validCurrencies = ['CNY', 'USD', 'EUR', 'GBP', 'JPY'];
            if (currency && !validCurrencies.includes(currency)) {
                return res.status(400).json({
                    success: false,
                    error: '无效的货币设置'
                });
            }

            // 验证语言设置
            const validLanguages = ['zh-CN', 'en-US', 'ja-JP'];
            if (language && !validLanguages.includes(language)) {
                return res.status(400).json({
                    success: false,
                    error: '无效的语言设置'
                });
            }

            // 验证主题设置
            const validThemes = ['light', 'dark', 'system'];
            if (theme && !validThemes.includes(theme)) {
                return res.status(400).json({
                    success: false,
                    error: '无效的主题设置'
                });
            }

            await client.query('BEGIN');

            // 更新设置
            const result = await client.query(
                `UPDATE user_settings 
                SET 
                    currency = COALESCE($1, currency),
                    language = COALESCE($2, language),
                    theme = COALESCE($3, theme),
                    notification_enabled = COALESCE($4, notification_enabled),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $5
                RETURNING *`,
                [
                    currency,
                    language,
                    theme,
                    notification_enabled,
                    req.user.id
                ]
            );

            // 记录活动
            await activityLogService.logActivity({
                userId: req.user.id,
                type: 'settings_update',
                description: '更新用户设置',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    currency,
                    language,
                    theme,
                    notification_enabled
                }
            });

            await client.query('COMMIT');

            res.json({
                success: true,
                data: result.rows[0],
                message: '设置已更新'
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('更新用户设置错误:', error);
            res.status(500).json({
                success: false,
                error: '更新用户设置失败'
            });
        } finally {
            client.release();
        }
    }

    // 获取默认货币的汇率
    async getCurrencyRates(req: Request, res: Response) {
        try {
            // 这里可以接入外部汇率 API
            // 目前返回固定汇率作为示例
            const rates = {
                CNY: 1.0,
                USD: 0.14,
                EUR: 0.13,
                GBP: 0.11,
                JPY: 15.5
            };

            res.json({
                success: true,
                data: rates
            });
        } catch (error) {
            console.error('获取汇率错误:', error);
            res.status(500).json({
                success: false,
                error: '获取汇率失败'
            });
        }
    }
}

export default new UserSettingsController();