// src/pages/ActivityLogPage.tsx

import React, { useState } from 'react';  // 添加 useState 导入
import { useQuery } from '@tanstack/react-query';
import ActivityLogList from '../components/activity/ActivityLogList';
import ExportActivityLogs from '../components/activity/ExportActivityLogs';
import Card from '../components/ui/Card';

const ActivityLogPage: React.FC = () => {
    // 添加状态管理
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        activityType: '',
        searchText: ''
    });

    // 获取活动统计数据
    const { data: stats, isLoading } = useQuery({
        queryKey: ['activity-stats', filters],  // 添加 filters 作为依赖
        queryFn: async () => {
            const params = new URLSearchParams({
                ...filters,
                startDate: filters.startDate,
                endDate: filters.endDate,
                activityType: filters.activityType
            });
            const response = await fetch(`/api/activities/statistics?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch activity statistics');
            }
            return response.json();
        }
    });

    if (isLoading) {
        return <div>加载中...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">活动日志</h1>
                <p className="mt-1 text-sm text-gray-500">
                    查看和导出你的账户活动记录
                </p>
            </div>

            {/* 活动统计概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900">
                            今日活动
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-primary-600">
                            {stats?.data?.find((s: any) => 
                                new Date(s.latest).toDateString() === new Date().toDateString()
                            )?.count || 0}
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900">
                            本月活动
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-primary-600">
                            {stats?.data?.reduce((sum: number, stat: any) => {
                                const date = new Date(stat.latest);
                                const now = new Date();
                                return date.getMonth() === now.getMonth() && 
                                       date.getFullYear() === now.getFullYear()
                                    ? sum + stat.count
                                    : sum;
                            }, 0)}
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900">
                            总活动数
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-primary-600">
                            {stats?.data?.reduce((sum: number, stat: any) => 
                                sum + stat.count, 0
                            )}
                        </p>
                    </div>
                </Card>
            </div>

            {/* 导出功能 */}
            <ExportActivityLogs />

            {/* 活动列表 */}
            <ActivityLogList filters={filters} onFilterChange={setFilters} />
        </div>
    );
};

export default ActivityLogPage;