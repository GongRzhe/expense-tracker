import { Pool } from 'pg';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建数据库连接池
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // 设置连接超时时间为 30 秒
    connectionTimeoutMillis: 30000,
    // 设置空闲连接超时时间为 10 秒
    idleTimeoutMillis: 10000,
    // 最大连接数
    max: 20
});

// 测试数据库连接
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to database');
    release();
});

// 导出连接池以供其他模块使用
export default pool;