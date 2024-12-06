// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import apiClient from '../services/apiClient';

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const navigate = useNavigate();
    const { showToast } = useToast();

    const loginMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            // const response = await fetch('/api/auth/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(data)
            // });
            // if (!response.ok) {
            //     const error = await response.json();
            //     throw new Error(error.error || '登录失败');
            // }
            // return response.json();
            return apiClient.post('/auth/login', data);
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            showToast('登录成功', 'success');
            navigate('/');
        },
        onError: (error: Error) => {
            showToast(error.message, 'error');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        登录您的账户
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        或{' '}
                        <Link 
                            to="/register" 
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            注册新账户
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="用户名"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            autoComplete="username"
                            required
                        />

                        <Input
                            label="密码"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={loginMutation.isPending}
                        >
                            登录
                        </Button>
                    </div>

                    <div className="text-center">
                        <Link 
                            to="/forgot-password"
                            className="text-sm text-primary-600 hover:text-primary-500"
                        >
                            忘记密码？
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;