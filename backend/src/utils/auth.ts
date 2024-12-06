// src/utils/auth.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { User } from '../types/user';

// 从环境变量获取密钥，如果不存在则生成一个随机密钥
const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex');

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// 密码验证
export const verifyPassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

// 生成JWT令牌
export const generateToken = (
    user: User,
    expiresIn: string = '7d'
): { token: string; expires_at: Date } => {
    const payload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    // 计算过期时间
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const expires_at = new Date((decoded.exp || 0) * 1000);

    return { token, expires_at };
};

// 验证JWT令牌
export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// 生成会话ID
export const generateSessionId = (): string => {
    return randomBytes(32).toString('hex');
};

// 密码强度检查
export const checkPasswordStrength = (password: string): {
    isStrong: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('密码长度至少为8个字符');
    }

    let hasUpperCase = false;
    let hasLowerCase = false;
    let hasNumber = false;
    let hasSpecial = false;

    // 检查每个字符
    for (const char of password) {
        if (char >= 'A' && char <= 'Z') hasUpperCase = true;
        else if (char >= 'a' && char <= 'z') hasLowerCase = true;
        else if (char >= '0' && char <= '9') hasNumber = true;
        else hasSpecial = true;
    }

    if (!hasUpperCase) {
        errors.push('密码必须包含至少一个大写字母');
    }

    if (!hasLowerCase) {
        errors.push('密码必须包含至少一个小写字母');
    }

    if (!hasNumber) {
        errors.push('密码必须包含至少一个数字');
    }

    if (!hasSpecial) {
        errors.push('密码必须包含至少一个特殊字符');
    }

    // 增加调试输出
    console.log('Password check result:', {
        password,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecial,
        errors
    });

    return {
        isStrong: errors.length === 0,
        errors
    };
};

// 获取用户设备信息
export const parseUserAgent = (userAgent: string): string => {
    // 简单的 User-Agent 解析
    const browser = userAgent.match(/(chrome|firefox|safari|edge|ie|opera)[\/\s](\d+)/i);
    const os = userAgent.match(/(windows|mac|linux|android|ios)[\/\s](\d+)/i);

    return `${browser?.[1] || 'Unknown'} ${browser?.[2] || ''} on ${os?.[1] || 'Unknown'}`;
};

// 验证邮箱格式
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 验证用户名格式
export const isValidUsername = (username: string): boolean => {
    // 允许字母、数字、下划线和连字符，长度4-20
    const usernameRegex = /^[a-zA-Z0-9_-]{4,20}$/;
    return usernameRegex.test(username);
};

// 限制登录尝试次数
export class LoginAttemptTracker {
    private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
    private readonly MAX_ATTEMPTS = 5;
    private readonly LOCK_DURATION = 15 * 60 * 1000; // 15分钟

    public recordAttempt(identifier: string): boolean {
        const now = Date.now();
        const attempt = this.attempts.get(identifier);

        if (!attempt) {
            this.attempts.set(identifier, { count: 1, lastAttempt: now });
            return true;
        }

        if (now - attempt.lastAttempt > this.LOCK_DURATION) {
            this.attempts.set(identifier, { count: 1, lastAttempt: now });
            return true;
        }

        if (attempt.count >= this.MAX_ATTEMPTS) {
            return false;
        }

        attempt.count += 1;
        attempt.lastAttempt = now;
        this.attempts.set(identifier, attempt);
        return true;
    }

    public getRemainingAttempts(identifier: string): number {
        const attempt = this.attempts.get(identifier);
        if (!attempt) return this.MAX_ATTEMPTS;

        if (Date.now() - attempt.lastAttempt > this.LOCK_DURATION) {
            this.attempts.delete(identifier);
            return this.MAX_ATTEMPTS;
        }

        return Math.max(0, this.MAX_ATTEMPTS - attempt.count);
    }

    public clearAttempts(identifier: string): void {
        this.attempts.delete(identifier);
    }
}

// 创建登录尝试跟踪器实例
export const loginAttemptTracker = new LoginAttemptTracker();