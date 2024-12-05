// src/components/activity/ExportActivityLogs.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const activityTypes = [
    { value: '', label: '所有类型' },
    { value: 'login', label: '登录' },
    { value: 'logout', label: '退出' },
    { value: 'profile_update', label: '更新资料' },
    { value: 'expense_create', label: '创建支出' },
    { value: 'expense_update', label: '更新支出' },
    { value: 'expense_delete', label: '删除支出' },
    { value: 'category_create', label: '创建分类' },
    { value: 'category_update', label: '更新分类' },
    { value: 'category_delete', label: '删除分类' },
    { value: 'settings_update', label: '更新设置' },
    { value: 'export_data', label: '导出数据' }
];

const ExportActivityLogs: React.FC = () => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        activityType: ''
    });

    const [isExporting, setIsExporting] = useState(false);

    // 获取导出预览
    const { data: preview, isLoading } = useQuery({
        queryKey: ['export-preview', filters],
        queryFn: async () => {
            const params = new URLSearchParams({
                ...filters
            });
            const response = await fetch(`/api/activities/export/preview?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch export preview');
            }
            return response.json();
        },
        enabled: true
    });

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                ...filters,
                format
            });

            if (format === 'json') {
                const response = await fetch(`/api/activities/export/download?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Export failed');
                }
                const data = await response.json();
                // 下载 JSON 文件
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `activity-logs-${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // CSV 直接下载
                window.location.href = `/api/activities/export/download?${params}`;
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Card title="导出活动日志">
            <div className="space-y-6">
                {/* 筛选条件 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        type="date"
                        label="开始日期"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            startDate: e.target.value
                        }))}
                    />

                    <Input
                        type="date"
                        label="结束日期"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            endDate: e.target.value
                        }))}
                    />

                    <Select
                        label="活动类型"
                        value={filters.activityType}
                        options={activityTypes}
                        onChange={(value) => setFilters(prev => ({
                            ...prev,
                            activityType: value.toString()
                        }))}
                    />
                </div>

                {/* 预览信息 */}
                {preview?.data && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <h3 className="font-medium">导出预览</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">总记录数</p>
                                <p className="text-lg font-medium">
                                    {preview.data.total_records}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">涉及用户数</p>
                                <p className="text-lg font-medium">
                                    {preview.data.user_count}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">最早记录</p>
                                <p className="text-lg font-medium">
                                    {new Date(preview.data.earliest_date).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">最新记录</p>
                                <p className="text-lg font-medium">
                                    {new Date(preview.data.latest_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 导出按钮 */}
                <div className="flex space-x-4">
                    <Button
                        variant="primary"
                        onClick={() => handleExport('csv')}
                        isLoading={isExporting}
                    >
                        导出 CSV
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleExport('json')}
                        isLoading={isExporting}
                    >
                        导出 JSON
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ExportActivityLogs;