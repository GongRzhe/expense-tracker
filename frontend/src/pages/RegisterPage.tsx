// src/pages/RegisterPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';


const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        full_name: '',
        city: '',
        country: ''
    });

    const navigate = useNavigate();
    const { showToast } = useToast();

    const registerMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '注册失败');
            }
            return response.json();
        },
        onSuccess: () => {
            showToast('注册成功，请登录', 'success');
            navigate('/login');
        },
        onError: (error: Error) => {
            showToast(error.message, 'error');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirm) {
            showToast('两次输入的密码不匹配', 'error');
            return;
        }

        registerMutation.mutate(formData);
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
                        创建新账户
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        或{' '}
                        <Link
                            to="/login"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            返回登录
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
                            required
                            autoComplete="username"
                        />

                        <Input
                            label="电子邮箱"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            autoComplete="email"
                        />

                        <Input
                            label="密码"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            autoComplete="new-password"
                        />
                        <PasswordStrengthIndicator password={formData.password} />
                        <p className="mt-1 text-sm text-gray-500">
                            密码必须：
                            <ul className="list-disc list-inside ml-2">
                                <li>至少8个字符</li>
                                <li>包含至少一个大写字母</li>
                                <li>包含至少一个小写字母</li>
                                <li>包含至少一个数字</li>
                                <li>包含至少一个特殊字符</li>
                            </ul>
                        </p>

                        <Input
                            label="确认密码"
                            name="password_confirm"
                            type="password"
                            value={formData.password_confirm}
                            onChange={handleInputChange}
                            required
                            autoComplete="new-password"
                        />

                        <Input
                            label="姓名"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            autoComplete="name"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="城市"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                autoComplete="address-level2"
                            />

                            <Input
                                label="国家"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                autoComplete="country-name"
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={registerMutation.isPending}
                        >
                            注册
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;