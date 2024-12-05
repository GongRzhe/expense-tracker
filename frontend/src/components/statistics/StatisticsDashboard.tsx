// src/components/statistics/StatisticsDashboard.tsx

import React from 'react';
import StatisticsOverview from './StatisticsOverview';
import CategoryChart from './CategoryChart';
import TrendChart from './TrendChart';
import ExportData from './ExportData';

export const StatisticsDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* 统计概览 */}
            <StatisticsOverview />

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 分类统计 */}
                <div className="w-full">
                    <CategoryChart />
                </div>

                {/* 支出趋势 */}
                <div className="w-full">
                    <TrendChart />
                </div>
            </div>

            {/* 导出功能 */}
            <ExportData />
        </div>
    );
};

export default StatisticsDashboard;