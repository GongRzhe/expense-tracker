// src/pages/HomePage.tsx

import React from 'react';
import StatisticsOverview from '../components/statistics/StatisticsOverview';
import TrendChart from '../components/statistics/TrendChart';
import ExpenseList from '../components/expenses/ExpenseList';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">控制面板</h1>
                <p className="mt-1 text-sm text-gray-500">
                    查看您的支出概览和最近记录
                </p>
            </div>

            {/* 统计概览 */}
            <StatisticsOverview />

            {/* 趋势图表 */}
            <div className="grid grid-cols-1 gap-6">
                <TrendChart />
            </div>

            {/* 最近支出记录 */}
            <Card title="最近支出">
                <ExpenseList />
            </Card>
        </div>
    );
};

export default HomePage;