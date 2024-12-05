// src/components/statistics/ExportData.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CloudArrowDownIcon } from '@heroicons/react/24/outline';
import { categoryService } from '../../services/categoryService';
import { exportService } from '../../services/statisticsService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

export const ExportData: React.FC = () => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        categoryId: ''
    });
    const [isExporting, setIsExporting] = useState(false);

    // 获取分类列表
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAllCategories()
    });

    // 获取导出概要信息
    const { data: summary } = useQuery({
        queryKey: ['export-summary', filters],
        queryFn: () => exportService.getExportSummary(
            filters.startDate,
            filters.endDate,
            filters.categoryId ? Number(filters.categoryId) : undefined
        )
    });

    const handleExport = async (format: 'csv' | 'json') => {
        setIsExporting(true);
        try {
            if (format === 'csv') {
                await exportService.exportCSV(
                    filters.startDate,
                    filters.endDate,
                    filters.categoryId ? Number(filters.categoryId) : undefined
                );
            } else {
                await exportService.exportJSON(
                    filters.startDate,
                    filters.endDate,
                    filters.categoryId ? Number(filters.categoryId) : undefined
                );
            }
        } catch (error) {
            console.error('导出失败:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(amount);
    };

    return (
        <Card title="数据导出">
            <div className="space-y-6">
                {/* 筛选条件 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            日期范围
                        </label>
                        <div className="flex space-x-2">
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <Select
                        label="支出分类"
                        value={filters.categoryId}
                        options={[
                            { value: '', label: '全部分类' },
                            ...(categories?.data?.map(cat => ({
                                value: cat.id.toString(),
                                label: cat.name
                            })) || [])
                        ]}
                        onChange={(value) => handleFilterChange('categoryId', value.toString())}
                    />
                </div>

                {/* 导出概要 */}
                {summary?.data && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p>导出数据概要：</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            <li>总记录数：{summary.data.total_records} 条</li>
                            <li>总金额：{formatAmount(Number(summary.data.total_amount))}</li>
                            <li>时间范围：{new Date(summary.data.earliest_date).toLocaleDateString()} 至 {new Date(summary.data.latest_date).toLocaleDateString()}</li>
                            <li>涉及分类数：{summary.data.category_count} 个</li>
                        </ul>
                    </div>
                )}

                {/* 导出按钮 */}
                <div className="flex space-x-4">
                    <Button
                        variant="primary"
                        onClick={() => handleExport('csv')}
                        isLoading={isExporting}
                        className="flex items-center"
                    >
                        <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                        导出CSV
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleExport('json')}
                        isLoading={isExporting}
                        className="flex items-center"
                    >
                        <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                        导出JSON
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ExportData;