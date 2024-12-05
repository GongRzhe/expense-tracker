-- backend/database/activity_log_schema.sql

-- 创建活动类型枚举
CREATE TYPE activity_type AS ENUM (
    'login',
    'logout',
    'profile_update',
    'password_change',
    'expense_create',
    'expense_update',
    'expense_delete',
    'category_create',
    'category_update',
    'category_delete',
    'settings_update',
    'export_data'
);

-- 创建活动日志表
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_metadata ON activity_logs USING gin(metadata);