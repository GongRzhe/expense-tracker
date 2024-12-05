// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import NavigationProgress from './components/ui/NavigationProgress';
import { ToastProvider } from './contexts/ToastContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ExpensesPage from './pages/ExpensesPage';
import CategoriesPage from './pages/CategoriesPage';
import StatisticsPage from './pages/StatisticsPage';

// 创建 Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <Router>
                        <NavigationProgress />
                        <MainLayout>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/expenses" element={<ExpensesPage />} />
                                <Route path="/categories" element={<CategoriesPage />} />
                                <Route path="/statistics" element={<StatisticsPage />} />
                            </Routes>
                        </MainLayout>
                    </Router>
                </ToastProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;