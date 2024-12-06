// src/components/statistics/StatisticsOverview.tsx

import React from 'react';
import {
    BanknotesIcon,
    ChartPieIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface StatisticsData {
    total_amount: number;
    average_amount: number;
    max_amount: number;
    min_amount: number;
    total_count: number;
    today_amount: number;
    today_count: number;
}

interface StatisticsOverviewProps {
    data?: StatisticsData;
}

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ data }) => {
    // 格式化金额
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    // 统计卡片定义
    const stats = [
        {
            title: '总支出',
            value: formatAmount(data?.total_amount || 0),
            icon: BanknotesIcon,
            iconColor: 'bg-blue-500',
            description: `共 ${data?.total_count || 0} 笔支出`
        },
        {
            title: '平均支出',
            value: formatAmount(data?.average_amount || 0),
            icon: ChartPieIcon,
            iconColor: 'bg-green-500',
            description: '每笔支出平均值'
        },
        {
            title: '最高支出',
            value: formatAmount(data?.max_amount || 0),
            icon: ArrowTrendingUpIcon,
            iconColor: 'bg-red-500',
            description: '单笔最高金额'
        },
        {
            title: '最低支出',
            value: formatAmount(data?.min_amount || 0),
            icon: ArrowTrendingDownIcon,
            iconColor: 'bg-yellow-500',
            description: '单笔最低金额'
        }
    ];

    if (!data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="w-32 h-4 bg-gray-200 rounded"></div>
                            <div className={`p-3 rounded-full bg-gray-200`}></div>
                        </div>
                        <div className="mt-4 w-24 h-8 bg-gray-200 rounded"></div>
                        <div className="mt-2 w-40 h-4 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div 
                    key={index} 
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">
                            {stat.title}
                        </h3>
                        <div className={`p-3 rounded-full ${stat.iconColor}`}>
                            <stat.icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-gray-900">
                        {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {stat.description}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default StatisticsOverview;