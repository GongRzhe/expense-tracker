// src/components/activity/ActivityLogList.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ClockIcon,
    UserIcon,
    MapPinIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';

interface ActivityLog {
    id: number;
    activity_type: string;
    description: string;
    ip_address: string;
    user_agent: string;
    metadata: any;
    created_at: string;
}

const activityTypeLabels: Record<string, string> = {
    login: '登录',
    logout: '退出',
    profile_update: '更新资料',
    password_change: '修改密码',
    expense_create: '创建支出',
    expense_update: '更新支出',
    expense_delete: '删除支出',
    category_create: '创建分类',
    category_update: '更新分类',
    category_delete: '删除分类',
    settings_update: '更新设置',
    export_data: '导出数据'
};

const activityTypeColors: Record<string, string> = {
    login: 'bg-green-100 text-green-800',
    logout: 'bg-yellow-100 text-yellow-800',
    profile_update: 'bg-blue-100 text-blue-800',
    password_change: 'bg-purple-100 text-purple-800',
    expense_create: 'bg-indigo-100 text-indigo-800',
    expense_update: 'bg-cyan-100 text-cyan-800',
    expense_delete: 'bg-red-100 text-red-800',
    category_create: 'bg-pink-100 text-pink-800',
    category_update: 'bg-orange-100 text-orange-800',
    category_delete: 'bg-rose-100 text-rose-800',
    settings_update: 'bg-teal-100 text-teal-800',
    export_data: 'bg-lime-100 text-lime-800'
};

export const ActivityLogList: React.FC = () => {
    const { data: activities, isLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await fetch('/api/activities/my-activities', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }
            const data = await response.json();
            return data.data;
        }
    });

    if (isLoading) {
        return <div>加载活动记录中...</div>;
    }

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

    return (
        <Card title="活动日志">
            <div className="space-y-6">
                {activities?.activities.map((activity: ActivityLog) => (
                    <div
                        key={activity.id}
                        className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow"
                    >
                        <div className="flex-shrink-0">
                            <div className={`p-2 rounded-full ${activityTypeColors[activity.activity_type] || 'bg-gray-100 text-gray-800'}`}>
                                <ClockIcon className="h-5 w-5" />
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                    {activityTypeLabels[activity.activity_type] || activity.activity_type}
                                </p>
                                <span className="text-sm text-gray-500">
                                    {formatDate(activity.created_at)}
                                </span>
                            </div>
                            
                            <p className="mt-1 text-sm text-gray-600">
                                {activity.description}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                                {activity.ip_address && (
                                    <div className="flex items-center">
                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                        <span>IP: {activity.ip_address}</span>
                                    </div>
                                )}
                                
                                {activity.user_agent && (
                                    <div className="flex items-center">
                                        <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
                                        <span>{activity.user_agent}</span>
                                    </div>
                                )}
                            </div>

                            {activity.metadata && (
                                <div className="mt-2 text-xs text-gray-500">
                                    <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(activity.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {activities?.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <nav className="flex space-x-2">
                        {Array.from({ length: activities.totalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`px-3 py-1 rounded-md ${
                                    activities.page === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => {
                                    // TODO: 实现分页功能
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </Card>
    );
};

export default ActivityLogList;