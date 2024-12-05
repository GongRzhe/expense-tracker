// src/services/categoryService.ts

import apiClient from './apiClient';
import { ApiResponse, Category } from '../types';

export const categoryService = {
    // 获取所有分类
    async getAllCategories() {
        return apiClient.get<any, ApiResponse<Category[]>>('/categories');
    },

    // 获取单个分类
    async getCategory(id: number) {
        return apiClient.get<any, ApiResponse<Category>>(`/categories/${id}`);
    },

    // 创建分类
    async createCategory(name: string) {
        return apiClient.post<any, ApiResponse<Category>>('/categories', { name });
    },

    // 更新分类
    async updateCategory(id: number, name: string) {
        return apiClient.put<any, ApiResponse<Category>>(`/categories/${id}`, { name });
    },

    // 删除分类
    async deleteCategory(id: number) {
        return apiClient.delete<any, ApiResponse<Category>>(`/categories/${id}`);
    }
};

export default categoryService;