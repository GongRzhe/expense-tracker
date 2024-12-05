// src/components/categories/CategoryForm.tsx

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CategoryFormProps {
    category?: Category | null;
    onClose: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose }) => {
    const [name, setName] = useState(category?.name || '');
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: { id?: number; name: string }) => {
            if (data.id) {
                return categoryService.updateCategory(data.id, data.name);
            }
            return categoryService.createCategory(data.name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            onClose();
        },
        onError: (error: any) => {
            setError(error.response?.data?.error || '保存失败');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('分类名称不能为空');
            return;
        }

        try {
            await mutation.mutateAsync({
                id: category?.id,
                name: name.trim()
            });
        } catch (error) {
            console.error('保存分类失败:', error);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-lg font-medium">
                            {category ? '编辑分类' : '添加分类'}
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
                            label="分类名称"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="请输入分类名称"
                            error={error}
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

export default CategoryForm;