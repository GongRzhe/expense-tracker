// src/pages/UserSettingsPage.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import apiClient from '../services/apiClient';

const currencyOptions = [
    { value: 'CNY', label: '人民币 (¥)' },
    { value: 'USD', label: '美元 ($)' },
    { value: 'EUR', label: '欧元 (€)' },
    { value: 'GBP', label: '英镑 (£)' },
    { value: 'JPY', label: '日元 (¥)' }
];

const languageOptions = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'ja-JP', label: '日本語' }
];

const themeOptions = [
    { value: 'light', label: '浅色' },
    { value: 'dark', label: '深色' },
    { value: 'system', label: '跟随系统' }
];

const UserSettingsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // 获取用户设置
    const { data: settings, isLoading } = useQuery({
        queryKey: ['user-settings'],
        queryFn: async () => {
            // const response = await fetch('/api/users/settings', {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // if (!response.ok) {
            //     throw new Error('获取用户设置失败');
            // }
            // return response.json();
            return apiClient.get('/users/settings');
        }
    });

    // 设置状态
    const [formData, setFormData] = useState({
        currency: settings?.data?.currency || 'CNY',
        language: settings?.data?.language || 'zh-CN',
        theme: settings?.data?.theme || 'light',
        notification_enabled: settings?.data?.notification_enabled || true
    });

    // 更新设置
    const updateSettingsMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await fetch('/api/users/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '更新设置失败');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-settings'] });
            showToast('设置已更新', 'success');
            
            // 应用新的主题设置
            document.documentElement.className = formData.theme === 'dark' ? 'dark' : '';
            
            // 存储语言设置
            localStorage.setItem('language', formData.language);
        },
        onError: (error: Error) => {
            showToast(error.message, 'error');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettingsMutation.mutate(formData);
    };

    if (isLoading) {
        return <div>加载中...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">应用设置</h1>
                <p className="mt-1 text-sm text-gray-500">
                    自定义您的使用体验
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 货币设置 */}
                    <div>
                        <Select
                            label="默认货币"
                            value={formData.currency}
                            options={currencyOptions}
                            onChange={(value) => setFormData(prev => ({
                                ...prev,
                                currency: value
                            }))}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            用于显示金额的默认货币
                        </p>
                    </div>

                    {/* 语言设置 */}
                    <div>
                        <Select
                            label="显示语言"
                            value={formData.language}
                            options={languageOptions}
                            onChange={(value) => setFormData(prev => ({
                                ...prev,
                                language: value
                            }))}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            应用界面的显示语言
                        </p>
                    </div>

                    {/* 主题设置 */}
                    <div>
                        <Select
                            label="界面主题"
                            value={formData.theme}
                            options={themeOptions}
                            onChange={(value) => setFormData(prev => ({
                                ...prev,
                                theme: value
                            }))}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            选择您喜欢的界面主题
                        </p>
                    </div>

                    {/* 通知设置 */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">通知提醒</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                接收重要提醒和通知
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={formData.notification_enabled}
                            className={`${
                                formData.notification_enabled ? 'bg-primary-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                notification_enabled: !prev.notification_enabled
                            }))}
                        >
                            <span
                                className={`${
                                    formData.notification_enabled ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={updateSettingsMutation.isPending}
                        >
                            保存设置
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default UserSettingsPage;