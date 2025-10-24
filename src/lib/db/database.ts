import mysql from 'mysql2/promise';

// MySQL connection pool
let pool: mysql.Pool | null = null;

export function getDatabase(): mysql.Pool {
  if (!pool) {
    // Get database configuration from environment
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    // Validate required configuration
    if (!dbConfig.user || !dbConfig.password || !dbConfig.database) {
      throw new Error('Missing required database configuration. Please check your .env file for DB_USER, DB_PASSWORD, and DB_NAME.');
    }

    pool = mysql.createPool(dbConfig);

    // Initialize schema on first connection
    initializeSchema();

    console.log('MySQL connection pool initialized');
  }
  return pool;
}

async function initializeSchema() {
  if (!pool) return;

  try {
    const connection = await pool.getConnection();

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Encrypted tokens table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_name VARCHAR(255) NOT NULL,
        encrypted_token TEXT NOT NULL,
        token_type VARCHAR(50) NOT NULL DEFAULT 'hubspot',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_token (user_id, token_name)
      )
    `);

    // Audit history table (optional, for tracking audits)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        audit_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
