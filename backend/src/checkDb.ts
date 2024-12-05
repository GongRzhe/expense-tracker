// src/checkDb.ts

import pool from './config/database';

async function checkDatabase() {
    const client = await pool.connect();
    try {
        // 检查表是否存在
        console.log('\n检查数据库表：');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('已存在的表：');
        tablesResult.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

        // 检查 expense_categories 表结构
        console.log('\n检查 expense_categories 表结构：');
        const categoriesStructure = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'expense_categories'
        `);
        console.log('expense_categories 表的列：');
        categoriesStructure.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });

        // 检查 expenses 表结构
        console.log('\n检查 expenses 表结构：');
        const expensesStructure = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'expenses'
        `);
        console.log('expenses 表的列：');
        expensesStructure.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });

        // 检查外键约束
        console.log('\n检查外键约束：');
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
        console.log('外键约束：');
        foreignKeys.rows.forEach(row => {
            console.log(`- ${row.constraint_name}: ${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
        });

        // 检查现有的分类数据
        console.log('\n检查现有的分类数据：');
        const categories = await client.query('SELECT * FROM expense_categories');
        console.log('已有的分类：');
        categories.rows.forEach(category => {
            console.log(`- ID: ${category.id}, Name: ${category.name}`);
        });

    } catch (err) {
        console.error('检查数据库时出错：', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkDatabase()
    .then(() => console.log('\n数据库检查完成'))
    .catch(console.error);