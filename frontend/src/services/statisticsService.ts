// src/services/statisticsService.ts

import apiClient from './apiClient';
import { ApiResponse, StatisticsOverview, CategoryStatistics, MonthlyTrend, DailyTrend, ExportSummary } from '../types';

export const statisticsService = {
    // 获取支出总览
    async getOverview() {
        return apiClient.get<any, ApiResponse<StatisticsOverview>>('/statistics/overview');
    },

    // 获取分类统计
    async getCategoryStats(startDate?: string, endDate?: string) {
        return apiClient.get<any, ApiResponse<CategoryStatistics[]>>('/statistics/category', {
            params: { startDate, endDate }
        });
    },

    // 获取月度趋势
    async getMonthlyTrend() {
        return apiClient.get<any, ApiResponse<MonthlyTrend[]>>('/statistics/monthly');
    },

    // 获取日支出趋势
    async getDailyTrend(days?: number) {
        return apiClient.get<any, ApiResponse<DailyTrend[]>>('/statistics/daily', {
            params: { days }
        });
    },

    // 获取高额支出记录
    async getHighExpenses(limit: number = 10) {
        return apiClient.get<any, ApiResponse<Expense[]>>('/statistics/high-expenses', {
            params: { limit }
        });
    }
};

// 导出服务
export const exportService = {
    // 导出CSV
    async exportCSV(startDate?: string, endDate?: string, categoryId?: number) {
        window.location.href = `${import.meta.env.VITE_API_URL}/export/csv?${new URLSearchParams({
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
            ...(categoryId && { categoryId: categoryId.toString() })
        })}`;
    },

    // 导出JSON
    async exportJSON(startDate?: string, endDate?: string, categoryId?: number) {
        window.location.href = `${import.meta.env.VITE_API_URL}/export/json?${new URLSearchParams({
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
            ...(categoryId && { categoryId: categoryId.toString() })
        })}`;
    },

    // 获取导出概要信息
    async getExportSummary(startDate?: string, endDate?: string, categoryId?: number) {
        return apiClient.get<any, ApiResponse<ExportSummary>>('/export/summary', {
            params: { startDate, endDate, categoryId }
        });
    }
};

export default {
    ...statisticsService,
    ...exportService
};