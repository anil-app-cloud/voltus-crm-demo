require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log('Connection successful! Solution =', rows[0].solution);
    
    await pool.end();
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}

testConnection(); 