// src/components/categories/CategoryList.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import CategoryForm from './CategoryForm';
import apiClient from '../../services/apiClient';

export const CategoryList: React.FC = () => {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const queryClient = useQueryClient();

    // 获取分类列表
    // const { data: categories, isLoading } = useQuery({
    //     queryKey: ['categories'],
    //     queryFn: () => categoryService.getAllCategories()
    // });
    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            return apiClient.get('/categories');
        }
    });

    // 删除分类
    const deleteMutation = useMutation({
        mutationFn: (id: number) => categoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('确定要删除这个分类吗？')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('删除分类失败:', error);
            }
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingCategory(null);
    };

    if (isLoading) {
        return <div>加载中...</div>;
    }

    return (
        <div className="space-y-4">
            <Card
                title="支出分类"
                action={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsFormOpen(true)}
                    >
                        添加分类
                    </Button>
                }
            >
                <div className="divide-y divide-gray-200">
                    {categories?.data?.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center justify-between py-3"
                        >
                            <span className="text-gray-900">{category.name}</span>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleEdit(category)}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(category.id)}
                                    isLoading={deleteMutation.isPending}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {isFormOpen && (
                <CategoryForm
                    category={editingCategory}
                    onClose={handleFormClose}
                />
            )}
        </div>
    );
};

export default CategoryList;