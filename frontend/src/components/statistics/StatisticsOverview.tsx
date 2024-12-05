// src/components/statistics/StatisticsOverview.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    BanknotesIcon, 
    ChartBarIcon, 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon 
} from '@heroicons/react/24/outline';
import { statisticsService } from '../../services/statisticsService';
import Card from '../ui/Card';

export const StatisticsOverview: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['statistics', 'overview'],
        queryFn: () => statisticsService.getOverview()
    });

    if (isLoading) {
        return <div>加载中...</div>;
    }

    const stats = data?.data;

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(amount);
    };

    const StatCard = ({ title, value, icon, color }: any) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="总支出"
                value={formatAmount(stats?.total_amount || 0)}
                icon={<BanknotesIcon className="h-6 w-6 text-white" />}
                color="bg-blue-500"
            />
            <StatCard
                title="平均支出"
                value={formatAmount(stats?.average_amount || 0)}
                icon={<ChartBarIcon className="h-6 w-6 text-white" />}
                color="bg-green-500"
            />
            <StatCard
                title="最高支出"
                value={formatAmount(stats?.max_amount || 0)}
                icon={<ArrowTrendingUpIcon className="h-6 w-6 text-white" />}
                color="bg-red-500"
            />
            <StatCard
                title="最低支出"
                value={formatAmount(stats?.min_amount || 0)}
                icon={<ArrowTrendingDownIcon className="h-6 w-6 text-white" />}
                color="bg-yellow-500"
            />
        </div>
    );
};

export default StatisticsOverview;