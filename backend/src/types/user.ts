// src/types/user.ts

export type UserRole = 'admin' | 'user';

export interface User {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    role: UserRole;
    is_active: boolean;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface UserSettings {
    id: number;
    user_id: number;
    currency: string;
    language: string;
    theme: 'light' | 'dark';
    notification_enabled: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Session {
    id: number;
    user_id: number;
    token: string;
    device_info?: string;
    ip_address?: string;
    expires_at: Date;
    created_at: Date;
}

export interface CreateUserDTO {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
}

export interface UpdateUserDTO {
    username?: string;
    email?: string;
    full_name?: string;
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    is_active?: boolean;
}

export interface UpdateUserSettingsDTO {
    currency?: string;
    language?: string;
    theme?: 'light' | 'dark';
    notification_enabled?: boolean;
}

export interface LoginDTO {
    username: string;
    password: string;
    device_info?: string;
}

export interface RegisterDTO extends CreateUserDTO {
    password_confirm: string;
}

export interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    settings: UserSettings;
    token: string;
    expires_at: Date;
}