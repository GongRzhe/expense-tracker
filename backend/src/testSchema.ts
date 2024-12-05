import pool from './config/database';
import * as fs from 'fs';
import * as path from 'path';

async function createDatabase() {
    try {
        // 读取 SQL 文件
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // 获取数据库连接
        const client = await pool.connect();
        
        try {
            // 执行 SQL 脚本
            await client.query(schema);
            console.log('数据库表结构创建成功！');

            // 验证表是否创建成功
            const tables = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            
            console.log('创建的表：');
            tables.rows.forEach((table: { table_name: string }) => {
                console.log(`- ${table.table_name}`);
            });

            // 检查分类数据是否插入成功
            const categories = await client.query('SELECT * FROM expense_categories');
            console.log('\n插入的支出分类：');
            categories.rows.forEach((category: { id: number, name: string }) => {
                console.log(`- ${category.id}: ${category.name}`);
            });

        } finally {
            client.release();
        }

        // 关闭连接池
        await pool.end();
        
    } catch (err) {
        console.error('创建数据库表时发生错误:', err);
        throw err;
    }
}

// 执行数据库创建
createDatabase().catch(console.error);