// src/executeSchemas.ts

import pool from './config/database';
import * as fs from 'fs';
import * as path from 'path';

async function executeSchemasInOrder() {
    const client = await pool.connect();
    try {
        console.log('开始执行数据库脚本...');
        
        // 开始事务
        await client.query('BEGIN');

        // 1. 执行用户模式
        console.log('执行 user_schema.sql...');
        const userSchemaPath = path.join(__dirname, '../database/user_schema.sql');
        const userSchema = fs.readFileSync(userSchemaPath, 'utf8');
        await client.query(userSchema);
        console.log('user_schema.sql 执行完成');

        // 2. 执行活动日志模式
        console.log('执行 activity_log_schema.sql...');
        const activityLogSchemaPath = path.join(__dirname, '../database/activity_log_schema.sql');
        const activityLogSchema = fs.readFileSync(activityLogSchemaPath, 'utf8');
        await client.query(activityLogSchema);
        console.log('activity_log_schema.sql 执行完成');

        // 提交事务
        await client.query('COMMIT');
        console.log('所有数据库脚本执行成功！');

        // 验证表是否创建成功
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('\n创建的表：');
        tables.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

    } catch (error) {
        // 如果出错，回滚事务
        await client.query('ROLLBACK');
        console.error('执行数据库脚本时出错:', error);
        throw error;
    } finally {
        // 释放客户端
        client.release();
        // 关闭连接池
        await pool.end();
    }
}

// 执行脚本
executeSchemasInOrder()
    .then(() => {
        console.log('\n数据库初始化完成');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n数据库初始化失败:', error);
        process.exit(1);
    });