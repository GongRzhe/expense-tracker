// src/layouts/MainLayout.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    HomeIcon, 
    ChartBarIcon, 
    TagIcon, 
    ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

interface NavItem {
    name: string;
    path: string;
    icon: React.ForwardRefExoticComponent<any>;
}

const navigation: NavItem[] = [
    { name: '概览', path: '/', icon: HomeIcon },
    { name: '支出记录', path: '/expenses', icon: ArrowRightOnRectangleIcon },
    { name: '分类管理', path: '/categories', icon: TagIcon },
    { name: '统计分析', path: '/statistics', icon: ChartBarIcon },
];

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航栏 */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo 和标题 */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-gray-900">
                                    支出管理系统
                                </span>
                            </div>
                        </div>

                        {/* 导航链接 */}
                        <div className="flex">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`inline-flex items-center px-4 text-sm font-medium ${
                                            isActive
                                                ? 'border-b-2 border-primary-500 text-primary-600'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>

            {/* 主要内容区域 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* 页脚 */}
            <footer className="bg-white shadow mt-auto">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} 支出管理系统. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;