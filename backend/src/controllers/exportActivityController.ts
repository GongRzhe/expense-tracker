// src/controllers/exportActivityController.ts

import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import pool from '../config/database';
import activityLogService from '../services/activityLogService';

export class ExportActivityController {
    // 导出活动日志
    async exportActivities(req: Request, res: Response) {
        const client = await pool.connect();
        try {
            const {
                format = 'csv',
                startDate,
                endDate,
                activityType
            } = req.query;

            // 构建查询条件
            const conditions: string[] = [];
            const params: any[] = [];
            let paramCount = 1;

            if (startDate) {
                conditions.push(`created_at >= $${paramCount}`);
                params.push(startDate);
                paramCount++;
            }

            if (endDate) {
                conditions.push(`created_at <= $${paramCount}`);
                params.push(endDate);
                paramCount++;
            }

            if (activityType) {
                conditions.push(`activity_type = $${paramCount}`);
                params.push(activityType);
                paramCount++;
            }

            // 如果不是管理员，只能导出自己的活动日志
            if (req.user.role !== 'admin') {
                conditions.push(`user_id = $${paramCount}`);
                params.push(req.user.id);
                paramCount++;
            }

            const whereClause = conditions.length > 0
                ? 'WHERE ' + conditions.join(' AND ')
                : '';

            // 查询活动日志
            const query = `
                SELECT 
                    al.id,
                    al.activity_type,
                    al.description,
                    al.ip_address,
                    al.user_agent,
                    al.metadata,
                    al.created_at,
                    u.username,
                    u.email
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
                ${whereClause}
                ORDER BY al.created_at DESC
            `;

            const result = await client.query(query, params);

            // 记录导出活动
            await activityLogService.logActivity({
                userId: req.user.id,
                type: 'export_data',
                description: `导出活动日志 (${format})`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    format,
                    startDate,
                    endDate,
                    activityType,
                    recordCount: result.rows.length
                }
            });

            if (format === 'json') {
                res.json({
                    success: true,
                    data: result.rows,
                    metadata: {
                        exportDate: new Date(),
                        totalRecords: result.rows.length,
                        exportedBy: req.user.username
                    }
                });
            } else {
                // CSV 格式导出
                const fields = [
                    {
                        label: '时间',
                        value: 'created_at'
                    },
                    {
                        label: '用户名',
                        value: 'username'
                    },
                    {
                        label: '活动类型',
                        value: 'activity_type'
                    },
                    {
                        label: '描述',
                        value: 'description'
                    },
                    {
                        label: 'IP地址',
                        value: 'ip_address'
                    },
                    {
                        label: '设备信息',
                        value: 'user_agent'
                    },
                    {
                        label: '详细信息',
                        value: (row: any) => JSON.stringify(row.metadata)
                    }
                ];

                const parser = new Parser({
                    fields,
                    delimiter: ',',
                    header: true
                });

                const csv = parser.parse(result.rows);

                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader(
                    'Content-Disposition',
                    `attachment; filename=activity-logs-${new Date().toISOString().slice(0,10)}.csv`
                );
                res.send('\ufeff' + csv); // 添加 BOM，确保 Excel 正确显示中文
            }
        } catch (error) {
            console.error('导出活动日志错误:', error);
            res.status(500).json({
                success: false,
                error: '导出活动日志失败'
            });
        } finally {
            client.release();
        }
    }

    // 获取导出预览
    async getExportPreview(req: Request, res: Response) {
        try {
            const { startDate, endDate, activityType } = req.query;

            // 获取匹配条件的记录数
            const countResult = await pool.query(`
                SELECT 
                    COUNT(*) as total_records,
                    COUNT(DISTINCT user_id) as user_count,
                    MIN(created_at) as earliest_date,
                    MAX(created_at) as latest_date
                FROM activity_logs
                WHERE ($1::date IS NULL OR created_at >= $1)
                AND ($2::date IS NULL OR created_at <= $2)
                AND ($3::activity_type IS NULL OR activity_type = $3)
                ${req.user.role !== 'admin' ? 'AND user_id = $4' : ''}
            `, [
                startDate || null,
                endDate || null,
                activityType || null,
                ...(req.user.role !== 'admin' ? [req.user.id] : [])
            ]);

            res.json({
                success: true,
                data: countResult.rows[0]
            });
        } catch (error) {
            console.error('获取导出预览错误:', error);
            res.status(500).json({
                success: false,
                error: '获取导出预览失败'
            });
        }
    }
}

export default new ExportActivityController();