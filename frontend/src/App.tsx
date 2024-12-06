// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ExpensesPage from './pages/ExpensesPage';
import CategoriesPage from './pages/CategoriesPage';
import StatisticsPage from './pages/StatisticsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import ProfilePage from './pages/ProfilePage';
import UserSettingsPage from './pages/UserSettingsPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
});

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <Router>
                        <Routes>
                            {/* 公开路由 */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* 受保护路由 */}
                            <Route path="/" element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <Routes>
                                            <Route path="/" element={<HomePage />} />
                                            <Route path="/expenses" element={<ExpensesPage />} />
                                            <Route path="/categories" element={<CategoriesPage />} />
                                            <Route path="/statistics" element={<StatisticsPage />} />
                                            <Route path="/activity-logs" element={<ActivityLogPage />} />
                                            <Route path="/profile" element={<ProfilePage />} />
                                            <Route path="/settings" element={<UserSettingsPage />} />
                                        </Routes>
                                    </MainLayout>
                                </PrivateRoute>
                            } />

                            <Route path="/*" element={ // 添加 /* 通配符
                                <PrivateRoute>
                                    <MainLayout>
                                        <Routes>
                                            <Route path="/" element={<HomePage />} />
                                            <Route path="/expenses" element={<ExpensesPage />} />
                                            <Route path="/categories" element={<CategoriesPage />} />
                                            <Route path="/statistics" element={<StatisticsPage />} />
                                            <Route path="/activity-logs" element={<ActivityLogPage />} />
                                            <Route path="/profile" element={<ProfilePage />} />
                                            <Route path="/settings" element={<UserSettingsPage />} />
                                        </Routes>
                                    </MainLayout>
                                </PrivateRoute>
                            } />
                        </Routes>

                    </Router>
                </ToastProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;