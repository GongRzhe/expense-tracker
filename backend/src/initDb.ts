// src/initDb.ts

import pool from './config/database';
import path from 'path';
import fs from 'fs';

async function initializeDatabase() {
    const client = await pool.connect();
    try {
        // 读取 schema.sql 文件
        const schemaFile = path.join(__dirname, '../database/schema.sql');
        const createTablesQuery = fs.readFileSync(schemaFile, 'utf8');

        // 执行建表语句
        await client.query(createTablesQuery);
        console.log('数据库表创建成功！');

        // 验证表是否创建成功
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        console.log('已创建的表：');
        result.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

    } catch (err) {
        console.error('初始化数据库时出错：', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

// 执行初始化
initializeDatabase()
    .then(() => console.log('数据库初始化完成'))
    .catch(err => console.error('数据库初始化失败：', err))
    .finally(() => process.exit());