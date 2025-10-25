import { getDatabase } from '../src/lib/db/database';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

// Parse .env file manually
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

// Set environment variables
Object.keys(env).forEach(key => {
  process.env[key] = env[key];
});

async function addUserRoles() {
  console.log('🚀 Starting user roles migration...\n');

  try {
    const db = getDatabase();
    const connection = await db.getConnection();

    // Step 1: Add role column to users table
    console.log('📝 Adding role column to users table...');
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' 
        AFTER name
      `);
      console.log('✅ Role column added successfully\n');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Role column already exists, skipping...\n');
      } else {
        throw error;
      }
    }

    // Step 2: Set Nico as Admin
    console.log('👑 Setting lafakisn@gmail.com as Admin...');
    const [result]: any = await connection.query(
      `UPDATE users SET role = 'admin' WHERE email = ?`,
      ['lafakisn@gmail.com']
    );

    if (result.affectedRows > 0) {
      console.log('✅ Admin role assigned to lafakisn@gmail.com\n');
    } else {
      console.log('⚠️  User lafakisn@gmail.com not found in database\n');
    }

    // Step 3: Verify current users and their roles
    console.log('📊 Current users and roles:');
    const [users]: any = await connection.query(
      `SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`
    );

    if (users.length === 0) {
      console.log('   No users found in database\n');
    } else {
      users.forEach((user: any) => {
        const roleEmoji = user.role === 'admin' ? '👑' : '👤';
        console.log(`   ${roleEmoji} ${user.email} - ${user.name || 'No name'} (${user.role})`);
      });
      console.log('');
    }

    connection.release();
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

addUserRoles();
