// src/components/ui/NavigationProgress.tsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const NavigationProgress: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [location]);

    if (!isLoading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-primary-100">
                <div 
                    className="h-1 bg-primary-500 transition-all duration-500"
                    style={{ 
                        width: '100%',
                        animation: 'progress 1s ease-in-out infinite'
                    }}
                />
            </div>
            <style>
                {`
                    @keyframes progress {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                `}
            </style>
        </div>
    );
};

export default NavigationProgress;