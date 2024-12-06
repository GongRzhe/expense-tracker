// src/pages/HomePage.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StatisticsOverview from '../components/statistics/StatisticsOverview';
import TrendChart from '../components/statistics/TrendChart';
import ExpenseList from '../components/expenses/ExpenseList';
import Card from '../components/ui/Card';
import apiClient from '../services/apiClient';

const HomePage: React.FC = () => {
    // 获取统计数据
    const { data: stats, isLoading } = useQuery({
        queryKey: ['home-statistics'],
        queryFn: async () => {
            try {
                const [overview, daily] = await Promise.all([
                    apiClient.get('/statistics/overview'),
                    apiClient.get('/statistics/daily')
                ]);

                return {
                    overview: overview.data,
                    daily: daily.data
                };
            } catch (error) {
                console.error('Error fetching statistics:', error);
                throw error;
            }
        },
        refetchInterval: 30000 // 每30秒自动刷新一次
    });

    // 获取最近支出记录
    const { data: recentExpenses } = useQuery({
        queryKey: ['recent-expenses'],
        queryFn: () => apiClient.get('/expenses', {
            params: {
                limit: 5,
                page: 1
            }
        })
    });

    if (isLoading) {
        return <div>数据加载中...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">控制面板</h1>
                <p className="mt-1 text-sm text-gray-500">
                    查看您的支出概览和最近记录
                </p>
            </div>

            {/* 统计概览 */}
            <StatisticsOverview data={stats?.overview} />

            {/* 趋势图表 */}
            <div className="grid grid-cols-1 gap-6">
                <TrendChart data={stats?.daily} />
            </div>

            {/* 最近支出记录 */}
            <Card title="最近支出">
                <ExpenseList 
                    data={recentExpenses?.data} 
                    showPagination={false}
                    limit={5}
                />
            </Card>
        </div>
    );
};

export default HomePage;