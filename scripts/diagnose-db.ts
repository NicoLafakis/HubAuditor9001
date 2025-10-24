/**
 * Database Connection Diagnostic Script
 * Tests database connectivity and provides detailed error information
 */

import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

// Parse .env file manually
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  process.exit(1);
}

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

console.log('🔍 DATABASE CONNECTION DIAGNOSTIC');
console.log('='.repeat(60));
console.log('\n📋 Configuration from .env:');
console.log(`   DB_HOST: ${env.DB_HOST}`);
console.log(`   DB_PORT: ${env.DB_PORT}`);
console.log(`   DB_USER: ${env.DB_USER}`);
console.log(`   DB_NAME: ${env.DB_NAME}`);
console.log(`   Password: ${env.DB_PASS ? '***' + env.DB_PASS.slice(-3) : 'NOT SET'}`);

async function testConnection() {
  try {
    console.log('\n🔄 Step 1: Testing basic MySQL connection...');
    const connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: parseInt(env.DB_PORT),
      user: env.DB_USER,
      password: env.DB_PASS,
      connectTimeout: 10000,
    });

    console.log('✅ Successfully connected to MySQL server!');

    // Get server version
    const [result] = await connection.query('SELECT VERSION() as version');
    const version = (result as any[])[0];
    console.log(`   Server version: ${version.version}`);

    // Try to select database
    console.log('\n🔄 Step 2: Checking if database exists...');
    await connection.query(`USE \`${env.DB_NAME}\``);
    console.log(`✅ Database "${env.DB_NAME}" exists and is accessible`);

    // List tables
    console.log('\n🔄 Step 3: Listing existing tables...');
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [env.DB_NAME]
    );
    
    if ((tables as any[]).length === 0) {
      console.log('   No tables found. Run "npm run db:init" to create them.');
    } else {
      console.log(`   Found ${(tables as any[]).length} table(s):`);
      (tables as any[]).forEach(table => {
        console.log(`     • ${table.TABLE_NAME}`);
      });
    }

    await connection.end();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL CHECKS PASSED - Database is ready!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ CONNECTION FAILED');
    console.error('='.repeat(60));
    console.error(`Error: ${error.message}`);

    if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('\n💡 AUTHENTICATION FAILED');
      console.error('   This means the username/password combination is incorrect.');
      console.error('   Please verify:');
      console.error(`     1. DB_USER is correct: ${env.DB_USER}`);
      console.error(`     2. DB_PASS is correct (check special characters)`);
      console.error(`     3. DB_HOST is correct: ${env.DB_HOST}`);
      console.error('\n   If you\'ve recently changed your hosting provider credentials,');
      console.error('   please update the .env file accordingly.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 CONNECTION REFUSED');
      console.error('   Cannot connect to the database server at:');
      console.error(`     ${env.DB_HOST}:${env.DB_PORT}`);
      console.error('   Possible causes:');
      console.error('     • MySQL server is not running');
      console.error('     • Host/port is incorrect');
      console.error('     • Firewall is blocking the connection');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 HOST NOT FOUND');
      console.error(`   Cannot resolve hostname: ${env.DB_HOST}`);
      console.error('   Please verify:');
      console.error('     • The hostname is correct');
      console.error('     • Your internet connection is working');
    }
    console.error('\n');
    process.exit(1);
  }
}

testConnection().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
