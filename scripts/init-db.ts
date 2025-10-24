/**
 * Database Initialization Script
 * 
 * This script initializes the MySQL database and creates all required tables.
 * Run with: npm run db:init
 * 
 * Make sure your .env file is properly configured with:
 * - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 * - JWT_SECRET and ENCRYPTION_KEY
 */

import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

// Parse .env file manually (since dotenv is not in dependencies)
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    env[key.trim()] = value;
  }
});

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME', 'JWT_SECRET', 'ENCRYPTION_KEY'];
const missingVars = requiredEnvVars.filter(v => !env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('\nPlease add these to your .env file.');
  process.exit(1);
}

async function initializeDatabase() {
  let connection: mysql.Connection | null = null;

  try {
    console.log('🔄 Connecting to database...');
    
    // Create connection (without specifying database initially)
    connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: parseInt(env.DB_PORT),
      user: env.DB_USER,
      password: env.DB_PASS,
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    console.log(`\n🔄 Creating database "${env.DB_NAME}" if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\``);
    console.log(`✅ Database "${env.DB_NAME}" is ready`);

    // Select the database
    await connection.query(`USE \`${env.DB_NAME}\``);

    // Create users table
    console.log('\n🔄 Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ users table created/exists');

    // Create user_tokens table
    console.log('🔄 Creating user_tokens table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_name VARCHAR(255) NOT NULL,
        encrypted_token LONGTEXT NOT NULL,
        token_type VARCHAR(50) NOT NULL DEFAULT 'hubspot',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_token (user_id, token_name),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ user_tokens table created/exists');

    // Create audit_history table
    console.log('🔄 Creating audit_history table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        audit_type VARCHAR(50) NOT NULL,
        audit_data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ audit_history table created/exists');

    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE INITIALIZATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Database Summary:');
    console.log(`   Host: ${env.DB_HOST}`);
    console.log(`   Port: ${env.DB_PORT}`);
    console.log(`   Database: ${env.DB_NAME}`);
    console.log(`   User: ${env.DB_USER}`);
    console.log('\n📋 Tables Created:');
    console.log('   • users - Stores user accounts and credentials');
    console.log('   • user_tokens - Stores encrypted HubSpot API tokens');
    console.log('   • audit_history - Tracks audit records');
    console.log('\n✨ You can now:');
    console.log('   1. Run "npm run dev" to start the development server');
    console.log('   2. Visit http://localhost:3000 to access the app');
    console.log('   3. Sign up a new account to test the authentication system');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ DATABASE INITIALIZATION FAILED');
    console.error('='.repeat(60));
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('Access denied')) {
        console.error('\n💡 Tip: Check your database credentials:');
        console.error('   - DB_USER:', env.DB_USER);
        console.error('   - DB_HOST:', env.DB_HOST);
        console.error('   - DB_PORT:', env.DB_PORT);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Tip: Cannot connect to database server. Make sure:');
        console.error('   - MySQL server is running');
        console.error('   - DB_HOST is correct:', env.DB_HOST);
        console.error('   - DB_PORT is correct:', env.DB_PORT);
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('\n💡 Tip: Cannot resolve database host:', env.DB_HOST);
        console.error('   - Check your internet connection');
        console.error('   - Verify DB_HOST in your .env file');
      }
    }
    
    console.error('\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization
initializeDatabase().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
