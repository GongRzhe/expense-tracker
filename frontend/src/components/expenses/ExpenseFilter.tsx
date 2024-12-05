// src/components/expenses/ExpenseFilter.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import { PaginationQuery } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface ExpenseFilterProps {
    filters: PaginationQuery;
    onFilterChange: (filters: Partial<PaginationQuery>) => void;
}

export const ExpenseFilter: React.FC<ExpenseFilterProps> = ({
    filters,
    onFilterChange,
}) => {
    // 获取分类列表
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAllCategories()
    });

    // 将分类数据转换为选择框选项格式
    const categoryOptions = categories?.data?.map(category => ({
        value: category.id,
        label: category.name
    })) || [];

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        日期范围
                    </label>
                    <div className="flex space-x-2">
                        <Input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => onFilterChange({ startDate: e.target.value })}
                            placeholder="开始日期"
                        />
                        <Input
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) => onFilterChange({ endDate: e.target.value })}
                            placeholder="结束日期"
                        />
                    </div>
                </div>

                <Select
                    label="支出分类"
                    value={filters.categoryId}
                    options={categoryOptions}
                    onChange={(value) => onFilterChange({ categoryId: Number(value) })}
                />

                <Input
                    label="每页显示"
                    type="number"
                    min={1}
                    max={100}
                    value={filters.limit || 10}
                    onChange={(e) => onFilterChange({ limit: Number(e.target.value) })}
                />
            </div>
        </Card>
    );
};

export default ExpenseFilter;