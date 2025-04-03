const mysql = require('mysql2/promise');
require('dotenv').config();

// Enhanced connection pool with better timeout settings
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  waitForConnections: true,
  charset: 'utf8mb4',
  enableKeepAlive: true,
  multipleStatements: true,
  dateStrings: true
});

// Function to execute queries with retry logic
const executeWithRetry = async (queryFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      console.warn(`Database query attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      lastError = error;
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
};

// Test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Falling back to local memory storage for development');
    // In a production app, you might want to exit the process here
    // process.exit(1);
  }
}

// Function to close all database connections gracefully
const closePool = async () => {
  try {
    console.log('Closing database connection pool...');
    await pool.end();
    console.log('✅ Database connections closed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error closing database connections:', error.message);
    return false;
  }
};

// Test connection on startup
testConnection();

// Register cleanup handlers
process.on('SIGINT', async () => {
  console.log('Received SIGINT signal. Shutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await closePool();
  process.exit(1);
});

module.exports = {
  pool,
  executeWithRetry,
  closePool
}; 