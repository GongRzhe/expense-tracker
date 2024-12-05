// src/fixDb.ts

import pool from './config/database';

async function fixDatabase() {
    const client = await pool.connect();
    try {
        // 开始事务
        await client.query('BEGIN');

        console.log('开始修复数据库...');

        // 1. 删除现有的外键约束
        console.log('删除现有的外键约束...');
        await client.query(`
            ALTER TABLE expenses
            DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
        `);

        // 2. 添加正确的外键约束
        console.log('添加正确的外键约束...');
        await client.query(`
            ALTER TABLE expenses
            ADD CONSTRAINT expenses_category_id_fkey
            FOREIGN KEY (category_id)
            REFERENCES expense_categories(id);
        `);

        // 提交事务
        await client.query('COMMIT');
        console.log('数据库修复完成！');

        // 验证修复结果
        const foreignKeys = await client.query(`
            SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY';
        `);

        console.log('\n当前的外键约束：');
        foreignKeys.rows.forEach(row => {
            console.log(`- ${row.constraint_name}: ${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
        });

    } catch (err) {
        // 如果出错，回滚事务
        await client.query('ROLLBACK');
        console.error('修复数据库时出错：', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

fixDatabase()
    .then(() => console.log('脚本执行完成'))
    .catch(error => {
        console.error('脚本执行失败：', error);
        process.exit(1);
    });