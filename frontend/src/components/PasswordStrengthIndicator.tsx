// src/components/PasswordStrengthIndicator.tsx

import React from 'react';

interface PasswordStrength {
    score: number;
    messages: string[];
}

interface PasswordStrengthIndicatorProps {
    password: string;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
    const strength: PasswordStrength = {
        score: 0,
        messages: []
    };

    // 检查长度
    if (password.length >= 8) {
        strength.score++;
    } else {
        strength.messages.push('至少8个字符');
    }

    // 检查大写字母
    if (/[A-Z]/.test(password)) {
        strength.score++;
    } else {
        strength.messages.push('需要大写字母');
    }

    // 检查小写字母
    if (/[a-z]/.test(password)) {
        strength.score++;
    } else {
        strength.messages.push('需要小写字母');
    }

    // 检查数字
    if (/\d/.test(password)) {
        strength.score++;
    } else {
        strength.messages.push('需要数字');
    }

    // 检查特殊字符
    if (/[^A-Za-z0-9]/.test(password)) {
        strength.score++;
    } else {
        strength.messages.push('需要特殊字符');
    }

    return strength;
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const strength = checkPasswordStrength(password);
    const strengthWidth = (strength.score / 5) * 100;
    
    let strengthColor = 'bg-red-500';
    if (strength.score >= 4) strengthColor = 'bg-green-500';
    else if (strength.score >= 3) strengthColor = 'bg-yellow-500';
    else if (strength.score >= 2) strengthColor = 'bg-orange-500';

    return (
        <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded-full">
                <div 
                    className={`h-full ${strengthColor} rounded-full transition-all duration-300`}
                    style={{ width: `${strengthWidth}%` }}
                />
            </div>
            {strength.messages.length > 0 && (
                <ul className="mt-1 text-sm text-red-500">
                    {strength.messages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;