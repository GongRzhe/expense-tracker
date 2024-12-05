// src/components/statistics/TrendChart.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend 
} from 'recharts';
import { statisticsService } from '../../services/statisticsService';
import Card from '../ui/Card';
import Select from '../ui/Select';

const TREND_OPTIONS = [
    { value: 'daily', label: '日趋势' },
    { value: 'monthly', label: '月趋势' }
];

export const TrendChart: React.FC = () => {
    const [trendType, setTrendType] = useState('daily');

    // 获取趋势数据
    const { data, isLoading } = useQuery({
        queryKey: ['statistics', trendType],
        queryFn: () => trendType === 'daily' 
            ? statisticsService.getDailyTrend()
            : statisticsService.getMonthlyTrend()
    });

    if (isLoading) {
        return <div>加载中...</div>;
    }

    // 格式化和验证数据
    const chartData = data?.data?.map(item => {
        const total = Number(item.total_amount) || 0;
        const count = Number(item.record_count) || 0;
        // 计算平均值，避免除以0的情况
        const average = count > 0 ? total / count : 0;
        
        return {
            name: trendType === 'daily' 
                ? new Date(item.date).toLocaleDateString('zh-CN')
                : new Date(item.month).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
            总支出: total,
            平均支出: average,
            记录数: count
        };
    }) || [];

    const formatAmount = (value: number) => {
        if (isNaN(value) || value === null || value === undefined) {
            return '¥0.00';
        }
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(value);
    };

    return (
        <Card 
            title="支出趋势" 
            action={
                <Select
                    value={trendType}
                    options={TREND_OPTIONS}
                    onChange={(value) => setTrendType(value.toString())}
                    className="w-32"
                />
            }
        >
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis 
                            yAxisId="left"
                            tickFormatter={formatAmount}
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right"
                            tickFormatter={(value) => `${value}笔`}
                        />
                        <Tooltip 
                            formatter={(value: any, name: string) => {
                                if (name === '记录数') return [`${value}笔`, name];
                                return [formatAmount(value), name];
                            }}
                        />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="总支出"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                        />
                        <Line 
                            yAxisId="left"
                            type="monotone"
                            dataKey="平均支出"
                            stroke="#82ca9d"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="记录数"
                            stroke="#ffc658"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default TrendChart;