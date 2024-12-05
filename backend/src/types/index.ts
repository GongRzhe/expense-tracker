// src/types/index.ts

// 支出分类接口
export interface ExpenseCategory {
    id: number;
    name: string;
    created_at: Date;
}

// 支出记录接口
export interface Expense {
    id: number;
    description: string;
    amount: number;
    category_id: number | null;
    date: Date;
    created_at: Date;
    updated_at: Date;
}

// 创建支出记录的请求体接口
export interface CreateExpenseRequest {
    description: string;
    amount: number;
    category_id?: number;
    date: Date;
}

// 更新支出记录的请求体接口
export interface UpdateExpenseRequest {
    description?: string;
    amount?: number;
    category_id?: number;
    date?: Date;
}

// API 响应接口
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// 分页查询参数接口
export interface PaginationQuery {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    categoryId?: number;
}

// 分页响应接口
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}