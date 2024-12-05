// src/updateSchema.ts

import pool from './config/database';

async function updateSchema() {
    const client = await pool.connect();
    try {
        // 开始事务
        await client.query('BEGIN');

        console.log('开始更新数据库表结构...');

        // 检查 updated_at 列是否存在
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'expenses' 
            AND column_name = 'updated_at'
        `);

        if (checkColumn.rows.length === 0) {
            // 添加 updated_at 列
            console.log('添加 updated_at 列...');
            await client.query(`
                ALTER TABLE expenses 
                ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            `);
        }

        // 提交事务
        await client.query('COMMIT');
        console.log('数据库表结构更新完成！');

    } catch (err) {
        // 如果出错，回滚事务
        await client.query('ROLLBACK');
        console.error('更新数据库表结构时出错：', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

updateSchema()
    .then(() => console.log('脚本执行完成'))
    .catch(error => {
        console.error('脚本执行失败：', error);
        process.exit(1);
    });