// src/services/apiClient.ts

import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api'
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // 如果是 401 错误，可能是token过期，清除token并跳转到登录页
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default apiClient;