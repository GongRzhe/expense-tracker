// src/types/index.ts

// API 响应接口
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// 支出分类接口
export interface Category {
    id: number;
    name: string;
    created_at: string;
}

// 支出记录接口
export interface Expense {
    id: number;
    description: string;
    amount: number;
    category_id: number | null;
    category_name?: string;
    date: string;
    created_at: string;
}

// 创建支出的请求体接口
export interface CreateExpenseDTO {
    description: string;
    amount: number;
    category_id?: number;
    date: string;
}

// 更新支出的请求体接口
export interface UpdateExpenseDTO {
    description?: string;
    amount?: number;
    category_id?: number;
    date?: string;
}

// 分页查询参数接口
export interface PaginationQuery {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
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

// 统计概览接口
export interface StatisticsOverview {
    total_records: number;
    total_amount: number;
    average_amount: number;
    min_amount: number;
    max_amount: number;
}

// 分类统计接口
export interface CategoryStatistics {
    category_name: string;
    record_count: number;
    total_amount: number;
    average_amount: number;
}

// 月度趋势接口
export interface MonthlyTrend {
    month: string;
    record_count: number;
    total_amount: number;
    average_amount: number;
}

// 每日趋势接口
export interface DailyTrend {
    date: string;
    record_count: number;
    total_amount: number;
}

// 导出概要信息接口
export interface ExportSummary {
    total_records: number;
    total_amount: number;
    earliest_date: string;
    latest_date: string;
    category_count: number;
}

// 表单错误接口
export interface FormErrors {
    [key: string]: string;
}

// 查询过滤器接口
export interface ExpenseFilter {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    searchText?: string;
}

// 图表数据点接口
export interface ChartDataPoint {
    name: string;
    value: number;
}

// 日期范围接口
export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}