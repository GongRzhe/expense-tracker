// src/pages/ExpensesPage.tsx

import React from 'react';
import ExpenseList from '../components/expenses/ExpenseList';

const ExpensesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">支出记录</h1>
                <p className="mt-1 text-sm text-gray-500">
                    管理和查看您的所有支出记录
                </p>
            </div>

            <ExpenseList />
        </div>
    );
};

export default ExpensesPage;