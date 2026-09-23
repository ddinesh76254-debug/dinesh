const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
});

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME || 'hospital_management'}`);
        connection.release();
    } catch (err) {
        console.warn(`[Database Warning] Could not connect to MySQL at ${process.env.DB_HOST || 'localhost'}: ${err.message}`);
        console.warn(`[Database Info] If MySQL is not running yet, please follow instructions in README.md`);
    }
})();

module.exports = pool;
