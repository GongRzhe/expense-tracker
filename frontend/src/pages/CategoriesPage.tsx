// src/pages/CategoriesPage.tsx

import React from 'react';
import CategoryList from '../components/categories/CategoryList';

const CategoriesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
                <p className="mt-1 text-sm text-gray-500">
                    管理您的支出分类
                </p>
            </div>

            <CategoryList />
        </div>
    );
};

export default CategoriesPage;