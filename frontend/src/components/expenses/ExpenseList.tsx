// src/components/expenses/ExpenseList.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { expenseService } from '../../services/expenseService';
import { Expense, PaginationQuery } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ExpenseFilter from './ExpenseFilter';
import ExpenseForm from './ExpenseForm';
import apiClient from '../../services/apiClient';

export const ExpenseList: React.FC = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<PaginationQuery>({
        limit: 10,
        page: 1
    });
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // 获取支出列表
    // const { data, isLoading } = useQuery({
    //     queryKey: ['expenses', filters],
    //     queryFn: () => expenseService.getExpenses(filters)
    // });
    const { data, isLoading } = useQuery({
        queryKey: ['expenses', filters],
        queryFn: async () => {
            return apiClient.get('/expenses', { params: filters });
        }
    });

    // 处理分页
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // 处理筛选
    const handleFilterChange = (newFilters: Partial<PaginationQuery>) => {
        setPage(1);
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('确定要删除这条支出记录吗？')) {
            try {
                await expenseService.deleteExpense(id);
                // 重新获取数据
                setFilters(prev => ({ ...prev }));
            } catch (error) {
                console.error('删除支出记录失败:', error);
            }
        }
    };

    const formatAmount = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(numAmount);
    };

    if (isLoading) {
        return <div>加载中...</div>;
    }

    return (
        <div className="space-y-4">
            <ExpenseFilter
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            <Card
                title="支出记录"
                action={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsFormOpen(true)}
                    >
                        添加支出
                    </Button>
                }
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    日期
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    描述
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    金额
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    分类
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.data?.items.map((expense) => (
                                <tr key={expense.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(expense.date).toLocaleDateString('zh-CN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {expense.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatAmount(expense.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {expense.category_name || '未分类'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleEdit(expense)}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(expense.id)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 分页 */}
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-700">
                        共 {data?.data?.total || 0} 条记录
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                        >
                            上一页
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={!data?.data?.hasMore}
                            onClick={() => handlePageChange(page + 1)}
                        >
                            下一页
                        </Button>
                    </div>
                </div>
            </Card>

            {isFormOpen && (
                <ExpenseForm
                    expense={editingExpense}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingExpense(null);
                    }}
                />
            )}
        </div>
    );
};

export default ExpenseList;