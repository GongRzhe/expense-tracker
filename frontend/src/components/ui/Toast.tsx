// src/components/ui/Toast.tsx

import React from 'react';
import { 
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const iconMap = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationCircleIcon
};

const bgColorMap = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50'
};

const textColorMap = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800'
};

const borderColorMap = {
    success: 'border-green-200',
    error: 'border-red-200',
    info: 'border-blue-200',
    warning: 'border-yellow-200'
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const Icon = iconMap[type];

    return (
        <div
            className={`fixed bottom-4 right-4 max-w-sm w-full ${bgColorMap[type]} border ${borderColorMap[type]} rounded-lg shadow-lg z-50`}
            role="alert"
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${textColorMap[type]}`} />
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className={`text-sm font-medium ${textColorMap[type]}`}>
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColorMap[type]}`}
                            onClick={onClose}
                        >
                            <span className="sr-only">关闭</span>
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;