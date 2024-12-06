// src/components/activity/ActivityLogFilter.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface ActivityLogFilterProps {
    filters: {
        startDate: string;
        endDate: string;
        activityType: string;
        searchText: string;
    };
    onFilterChange: (filters: any) => void;
}

const activityTypeOptions = [
    { value: '', label: '所有活动' },
    { value: 'login', label: '登录' },
    { value: 'logout', label: '登出' },
    { value: 'profile_update', label: '更新资料' },
    { value: 'password_change', label: '修改密码' },
    { value: 'expense_create', label: '创建支出' },
    { value: 'expense_update', label: '更新支出' },
    { value: 'expense_delete', label: '删除支出' },
    { value: 'category_create', label: '创建分类' },
    { value: 'category_update', label: '更新分类' },
    { value: 'category_delete', label: '删除分类' },
    { value: 'settings_update', label: '更新设置' },
    { value: 'export_data', label: '导出数据' }
];

export const ActivityLogFilter: React.FC<ActivityLogFilterProps> = ({
    filters,
    onFilterChange
}) => {
    // 获取活动类型统计
    const { data: stats } = useQuery({
        queryKey: ['activity-type-stats', filters.startDate, filters.endDate],
        queryFn: async () => {
            const params = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate
            });
            const response = await fetch(`/api/activities/statistics?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch activity stats');
            }
            return response.json();
        }
    });

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                    type="date"
                    label="开始日期"
                    value={filters.startDate}
                    onChange={(e) => onFilterChange({
                        ...filters,
                        startDate: e.target.value
                    })}
                />

                <Input
                    type="date"
                    label="结束日期"
                    value={filters.endDate}
                    onChange={(e) => onFilterChange({
                        ...filters,
                        endDate: e.target.value
                    })}
                />

                <Select
                    label="活动类型"
                    value={filters.activityType}
                    options={activityTypeOptions.map(opt => ({
                        ...opt,
                        label: `${opt.label} ${stats?.data?.find(
                            (s: any) => s.activity_type === opt.value
                        )?.count ? `(${stats.data.find(
                            (s: any) => s.activity_type === opt.value
                        ).count})` : ''}`
                    }))}
                    onChange={(value) => onFilterChange({
                        ...filters,
                        activityType: value
                    })}
                />

                <Input
                    label="搜索"
                    type="search"
                    placeholder="搜索活动日志..."
                    value={filters.searchText}
                    onChange={(e) => onFilterChange({
                        ...filters,
                        searchText: e.target.value
                    })}
                />
            </div>

            {/* 活动类型统计 */}
            {stats?.data && stats.data.length > 0 && (
                <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                        {stats.data.map((stat: any) => (
                            <div
                                key={stat.activity_type}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    filters.activityType === stat.activity_type
                                        ? 'bg-primary-100 text-primary-800'
                                        : 'bg-gray-100 text-gray-700'
                                } cursor-pointer hover:bg-primary-50`}
                                onClick={() => onFilterChange({
                                    ...filters,
                                    activityType: filters.activityType === stat.activity_type 
                                        ? '' 
                                        : stat.activity_type
                                })}
                            >
                                {activityTypeOptions.find(
                                    opt => opt.value === stat.activity_type
                                )?.label || stat.activity_type}
                                <span className="ml-1 text-xs">
                                    ({stat.count})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ActivityLogFilter;