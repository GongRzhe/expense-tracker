// src/services/apiClient.ts

import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 响应拦截器：统一处理错误
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || '请求失败';
        console.error('API Error:', message);
        return Promise.reject(error);
    }
);

export default apiClient;