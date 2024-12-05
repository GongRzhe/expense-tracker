// src/components/expenses/ExpenseForm.tsx

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { expenseService } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import { Expense, CreateExpenseDTO } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface ExpenseFormProps {
    expense?: Expense | null;
    onClose: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onClose }) => {
    const [formData, setFormData] = useState<CreateExpenseDTO>({
        description: expense?.description || '',
        amount: expense?.amount || 0,
        category_id: expense?.category_id || undefined,
        date: expense?.date || new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    // 获取分类列表
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAllCategories()
    });

    // 创建或更新支出记录
    const mutation = useMutation({
        mutationFn: (data: CreateExpenseDTO) => {
            if (expense?.id) {
                return expenseService.updateExpense(expense.id, data);
            }
            return expenseService.createExpense(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            onClose();
        },
        onError: (error: any) => {
            setError(error.response?.data?.error || '保存失败');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 表单验证
        if (!formData.description.trim()) {
            setError('描述不能为空');
            return;
        }
        if (!formData.amount || formData.amount <= 0) {
            setError('金额必须大于0');
            return;
        }
        if (!formData.date) {
            setError('请选择日期');
            return;
        }

        try {
            await mutation.mutateAsync(formData);
        } catch (error) {
            console.error('保存支出记录失败:', error);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) : value
        }));
    };

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-lg font-medium">
                            {expense ? '编辑支出' : '添加支出'}
                        </Dialog.Title>
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="描述"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="请输入支出描述"
                            error={error}
                        />

                        <Input
                            label="金额"
                            name="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="请输入支出金额"
                        />

                        <Select
                            label="分类"
                            name="category_id"
                            value={formData.category_id}
                            options={categories?.data?.map(cat => ({
                                value: cat.id,
                                label: cat.name
                            })) || []}
                            onChange={(value) => handleInputChange({
                                target: { name: 'category_id', value }
                            } as any)}
                        />

                        <Input
                            label="日期"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleInputChange}
                        />

                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                取消
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={mutation.isPending}
                            >
                                保存
                            </Button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default ExpenseForm;