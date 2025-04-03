require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true // Important to run multiple SQL statements
    });

    console.log('Connected to database. Reading seed file...');
    
    // Read the seed file
    const seedFilePath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedFilePath, 'utf8');
    
    console.log('Executing seed commands...');
    
    // Execute the seed SQL
    await connection.query(seedSql);
    
    console.log('Seed completed successfully!');
    
    // Close the connection
    await connection.end();
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 