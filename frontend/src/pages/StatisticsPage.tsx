// src/pages/StatisticsPage.tsx

import React from 'react';
import StatisticsDashboard from '../components/statistics/StatisticsDashboard';

const StatisticsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">统计分析</h1>
                <p className="mt-1 text-sm text-gray-500">
                    查看支出统计和分析报告
                </p>
            </div>

            <StatisticsDashboard />
        </div>
    );
};

export default StatisticsPage;