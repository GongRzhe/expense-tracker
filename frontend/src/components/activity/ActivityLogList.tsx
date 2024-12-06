// src/components/activity/ActivityLogList.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../ui/Card';
import ActivityLogFilter from './ActivityLogFilter';
import Button from '../ui/Button';

export const ActivityLogList: React.FC = () => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        activityType: '',
        searchText: ''
    });

    const [page, setPage] = useState(1);
    const limit = 20;

    // 获取活动日志
    const { data, isLoading } = useQuery({
        queryKey: ['activities', filters, page],
        queryFn: async () => {
            const params = new URLSearchParams({
                ...filters,
                page: page.toString(),
                limit: limit.toString()
            });
            const response = await fetch(`/api/activities/my-activities?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }
            return response.json();
        }
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    if (isLoading) {
        return <div>加载中...</div>;
    }

    return (
        <div className="space-y-4">
            <ActivityLogFilter 
                filters={filters}
                onFilterChange={setFilters}
            />

            <Card title={`活动日志 (共 ${data?.data?.total || 0} 条记录)`}>
                <div className="space-y-4">
                    {data?.data?.activities.map((activity: any) => (
                        <div
                            key={activity.id}
                            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                                        {activity.activity_type}
                                    </span>
                                    <p className="mt-2 text-gray-700">
                                        {activity.description}
                                    </p>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {formatDate(activity.created_at)}
                                </span>
                            </div>

                            <div className="mt-2 text-sm text-gray-500">
                                <div className="flex items-center space-x-4">
                                    {activity.ip_address && (
                                        <span>IP: {activity.ip_address}</span>
                                    )}
                                    {activity.user_agent && (
                                        <span title={activity.user_agent}>
                                            {activity.user_agent.slice(0, 50)}
                                            {activity.user_agent.length > 50 ? '...' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {activity.metadata && (
                                <details className="mt-2">
                                    <summary className="text-sm text-primary-600 cursor-pointer">
                                        详细信息
                                    </summary>
                                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                                        {JSON.stringify(activity.metadata, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    ))}

                    {/* 分页 */}
                    {data?.data?.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                上一页
                            </Button>
                            <span className="text-sm text-gray-600">
                                第 {page} 页，共 {data.data.totalPages} 页
                            </span>
                            <Button
                                variant="secondary"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= data.data.totalPages}
                            >
                                下一页
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ActivityLogList;