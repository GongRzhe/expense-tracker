import pool from './config/database';

async function testDatabaseConnection() {
    try {
        // 获取连接
        const client = await pool.connect();
        console.log('成功连接到数据库！');

        // 执行简单的查询
        const result = await client.query('SELECT NOW()');
        console.log('数据库当前时间:', result.rows[0].now);

        // 释放连接
        client.release();
        
        // 关闭连接池
        await pool.end();
        
        console.log('测试完成，连接已关闭');
    } catch (err) {
        console.error('连接数据库时发生错误:', err);
    }
}

// 运行测试
testDatabaseConnection();