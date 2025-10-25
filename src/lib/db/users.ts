import { getDatabase } from './database';
import bcrypt from 'bcryptjs';
import { encryptToken, decryptToken } from '../encryption';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id: number;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface UserToken {
  id: number;
  user_id: number;
  token_name: string;
  encrypted_token: string;
  token_type: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new user with hashed password
 */
export async function createUser(email: string, password: string, name?: string): Promise<User | null> {
  try {
    console.log('[createUser] Starting user creation for:', email);
    const pool = getDatabase();
    console.log('[createUser] Database pool obtained');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('[createUser] Password hashed successfully');

    // New users are always 'user' role by default
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name || null, 'user']
    );
    console.log('[createUser] User inserted with ID:', result.insertId);

    // Return the created user
    return getUserById(result.insertId);
  } catch (error) {
    console.error('[createUser] Error creating user:', error);
    if (error instanceof Error) {
      console.error('[createUser] Error message:', error.message);
      console.error('[createUser] Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Verify user credentials and return user if valid
 */
export async function verifyUser(email: string, password: string): Promise<User | null> {
  try {
    const pool = getDatabase();

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, password_hash, name, role, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, row.password_hash);

    if (!isValid) {
      return null;
    }

    // Return user without password hash
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  try {
    const pool = getDatabase();

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const pool = getDatabase();

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const pool = getDatabase();

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

/**
 * Get user statistics (Admin only)
 */
export async function getUserStats(): Promise<{
  totalUsers: number;
  totalAudits: number;
  recentAudits: Array<{ user_email: string; audit_type: string; created_at: string }>;
}> {
  try {
    const pool = getDatabase();

    // Get total users
    const [userCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users'
    );

    // Get total audits
    const [auditCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM audit_history'
    );

    // Get recent audits with user info
    const [recentAudits] = await pool.execute<RowDataPacket[]>(
      `SELECT u.email as user_email, ah.audit_type, ah.created_at 
       FROM audit_history ah 
       JOIN users u ON ah.user_id = u.id 
       ORDER BY ah.created_at DESC 
       LIMIT 10`
    );

    return {
      totalUsers: userCount[0].count,
      totalAudits: auditCount[0].count,
      recentAudits: recentAudits.map(row => ({
        user_email: row.user_email,
        audit_type: row.audit_type,
        created_at: row.created_at,
      })),
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalUsers: 0,
      totalAudits: 0,
      recentAudits: [],
    };
  }
}

/**
 * Save an encrypted token for a user
 */
export async function saveUserToken(
  userId: number,
  tokenName: string,
  token: string,
  tokenType: string = 'hubspot'
): Promise<boolean> {
  try {
    const pool = getDatabase();

    // Encrypt the token before storing
    const encryptedToken = encryptToken(token);

    await pool.execute(
      `INSERT INTO user_tokens (user_id, token_name, encrypted_token, token_type)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         encrypted_token = VALUES(encrypted_token),
         token_type = VALUES(token_type),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, tokenName, encryptedToken, tokenType]
    );

    return true;
  } catch (error) {
    console.error('Error saving user token:', error);
    return false;
  }
}

/**
 * Get and decrypt a user's token
 */
export async function getUserToken(userId: number, tokenName: string): Promise<string | null> {
  try {
    const pool = getDatabase();

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT encrypted_token FROM user_tokens WHERE user_id = ? AND token_name = ?',
      [userId, tokenName]
    );

    if (rows.length === 0) {
      return null;
    }

    // Decrypt the token before returning
    return decryptToken(rows[0].encrypted_token);
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
}

/**
 * Delete a user's token
 */
export async function deleteUserToken(userId: number, tokenName: string): Promise<boolean> {
  try {
    const pool = getDatabase();

    await pool.execute(
      'DELETE FROM user_tokens WHERE user_id = ? AND token_name = ?',
      [userId, tokenName]
    );

    return true;
  } catch (error) {
    console.error('Error deleting user token:', error);
    return false;
  }
}

/**
 * Get all token names for a user (without decrypting)
 */
export async function getUserTokenList(userId: number): Promise<Array<{ token_name: string; token_type: string; created_at: string }>> {
  try {
    const pool = getDatabase();

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT token_name, token_type, created_at FROM user_tokens WHERE user_id = ?',
      [userId]
    );

    return rows.map(row => ({
      token_name: row.token_name,
      token_type: row.token_type,
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting user token list:', error);
    return [];
  }
}
