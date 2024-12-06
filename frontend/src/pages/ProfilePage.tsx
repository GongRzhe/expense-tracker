// src/pages/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import apiClient from '../services/apiClient';

const ProfilePage: React.FC = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // 获取用户当前信息
    const { data: userData, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: () => apiClient.get('/users/profile')
    });

    // 基本信息表单状态
    const [profileData, setProfileData] = useState({
        email: '',
        full_name: '',
        city: '',
        country: ''
    });

    // 密码表单状态
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        password_confirm: ''
    });

    // 当获取到用户数据时，更新表单状态
    useEffect(() => {
        if (userData?.data) {
            setProfileData({
                email: userData.data.email || '',
                full_name: userData.data.full_name || '',
                city: userData.data.city || '',
                country: userData.data.country || ''
            });
        }
    }, [userData]);

    // 更新基本信息
    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof profileData) => {
            return apiClient.put('/users/profile', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            showToast('个人资料已更新', 'success');
        },
        onError: (error: any) => {
            showToast(error.message || '更新个人资料失败', 'error');
        }
    });

    // 更新密码
    const updatePasswordMutation = useMutation({
        mutationFn: async (data: typeof passwordData) => {
            return apiClient.put('/users/password', data);
        },
        onSuccess: () => {
            setPasswordData({
                current_password: '',
                new_password: '',
                password_confirm: ''
            });
            showToast('密码已更新', 'success');
        },
        onError: (error: any) => {
            showToast(error.message || '更新密码失败', 'error');
        }
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate(profileData);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.password_confirm) {
            showToast('两次输入的密码不匹配', 'error');
            return;
        }
        updatePasswordMutation.mutate(passwordData);
    };

    if (isLoading) {
        return <div>加载中...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">个人资料设置</h1>
                <p className="mt-1 text-sm text-gray-500">更新您的个人信息和密码</p>
            </div>

            {/* 基本信息表单 */}
            <Card title="基本信息">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <Input
                        label="用户名"
                        value={userData?.data?.username || ''}
                        disabled
                        description="用户名不可更改"
                    />

                    <Input
                        label="电子邮箱"
                        value={profileData.email}
                        onChange={e => setProfileData(prev => ({
                            ...prev,
                            email: e.target.value
                        }))}
                        required
                    />

                    <Input
                        label="姓名"
                        value={profileData.full_name}
                        onChange={e => setProfileData(prev => ({
                            ...prev,
                            full_name: e.target.value
                        }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="城市"
                            value={profileData.city}
                            onChange={e => setProfileData(prev => ({
                                ...prev,
                                city: e.target.value
                            }))}
                        />

                        <Input
                            label="国家"
                            value={profileData.country}
                            onChange={e => setProfileData(prev => ({
                                ...prev,
                                country: e.target.value
                            }))}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            isLoading={updateProfileMutation.isPending}
                        >
                            保存更改
                        </Button>
                    </div>
                </form>
            </Card>

            {/* 密码更新表单 */}
            <Card title="更改密码">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <Input
                        label="当前密码"
                        type="password"
                        value={passwordData.current_password}
                        onChange={e => setPasswordData(prev => ({
                            ...prev,
                            current_password: e.target.value
                        }))}
                        required
                    />

                    <Input
                        label="新密码"
                        type="password"
                        value={passwordData.new_password}
                        onChange={e => setPasswordData(prev => ({
                            ...prev,
                            new_password: e.target.value
                        }))}
                        required
                    />
                    {passwordData.new_password && (
                        <PasswordStrengthIndicator password={passwordData.new_password} />
                    )}

                    <Input
                        label="确认新密码"
                        type="password"
                        value={passwordData.password_confirm}
                        onChange={e => setPasswordData(prev => ({
                            ...prev,
                            password_confirm: e.target.value
                        }))}
                        required
                    />

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={updatePasswordMutation.isPending}
                        >
                            更新密码
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProfilePage;