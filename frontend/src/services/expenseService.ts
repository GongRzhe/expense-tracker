// src/services/expenseService.ts

import apiClient from './apiClient';
import { ApiResponse, Expense, CreateExpenseDTO, UpdateExpenseDTO, PaginationQuery, PaginatedResponse } from '../types';

export const expenseService = {
    // 获取支出列表（带分页和筛选）
    async getExpenses(params: PaginationQuery) {
        return apiClient.get<any, ApiResponse<PaginatedResponse<Expense>>>('/expenses', { params });
    },

    // 获取单个支出
    async getExpense(id: number) {
        return apiClient.get<any, ApiResponse<Expense>>(`/expenses/${id}`);
    },

    // 创建支出
    async createExpense(data: CreateExpenseDTO) {
        return apiClient.post<any, ApiResponse<Expense>>('/expenses', data);
    },

    // 更新支出
    async updateExpense(id: number, data: UpdateExpenseDTO) {
        return apiClient.put<any, ApiResponse<Expense>>(`/expenses/${id}`, data);
    },

    // 删除支出
    async deleteExpense(id: number) {
        return apiClient.delete<any, ApiResponse<Expense>>(`/expenses/${id}`);
    }
};

export default expenseService;