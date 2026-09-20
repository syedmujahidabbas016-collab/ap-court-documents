const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ap_highcourt',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();

        console.log('MySQL Connected Successfully!');
        console.log(`Database: ${process.env.DB_NAME || 'ap_highcourt'}`);

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(20),
                role ENUM('advocate', 'judge', 'court_staff', 'public') DEFAULT 'public',
                password VARCHAR(255) NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                lastLogin DATETIME NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Users table ready!');

        connection.release();

        return pool;

    } catch (error) {
        console.error('MySQL connection failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Error Number:', error.errno);
        console.error('SQL State:', error.sqlState);

        process.exit(1);
    }
};

module.exports = {
    pool,
    connectDB
};