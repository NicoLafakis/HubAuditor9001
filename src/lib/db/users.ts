import { getDatabase } from './database';
import bcrypt from 'bcryptjs';
import { encryptToken, decryptToken } from '../encryption';

export interface User {
  id: number;
  email: string;
  name?: string;
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
    const db = getDatabase();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(email, passwordHash, name || null);

    // Return the created user
    return getUserById(result.lastInsertRowid as number);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Verify user credentials and return user if valid
 */
export async function verifyUser(email: string, password: string): Promise<User | null> {
  try {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT id, email, password_hash, name, created_at, updated_at
      FROM users
      WHERE email = ?
    `);

    const row = stmt.get(email) as any;

    if (!row) {
      return null;
    }

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
export function getUserById(id: number): User | null {
  try {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT id, email, name, created_at, updated_at
      FROM users
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      name: row.name,
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
export function getUserByEmail(email: string): User | null {
  try {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT id, email, name, created_at, updated_at
      FROM users
      WHERE email = ?
    `);

    const row = stmt.get(email) as any;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Save an encrypted token for a user
 */
export function saveUserToken(
  userId: number,
  tokenName: string,
  token: string,
  tokenType: string = 'hubspot'
): boolean {
  try {
    const db = getDatabase();

    // Encrypt the token before storing
    const encryptedToken = encryptToken(token);

    const stmt = db.prepare(`
      INSERT INTO user_tokens (user_id, token_name, encrypted_token, token_type)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, token_name)
      DO UPDATE SET
        encrypted_token = excluded.encrypted_token,
        token_type = excluded.token_type,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(userId, tokenName, encryptedToken, tokenType);
    return true;
  } catch (error) {
    console.error('Error saving user token:', error);
    return false;
  }
}

/**
 * Get and decrypt a user's token
 */
export function getUserToken(userId: number, tokenName: string): string | null {
  try {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT encrypted_token
      FROM user_tokens
      WHERE user_id = ? AND token_name = ?
    `);

    const row = stmt.get(userId, tokenName) as any;

    if (!row) {
      return null;
    }

    // Decrypt the token before returning
    return decryptToken(row.encrypted_token);
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
}

/**
 * Delete a user's token
 */
export function deleteUserToken(userId: number, tokenName: string): boolean {
  try {
    const db = getDatabase();

    const stmt = db.prepare(`
      DELETE FROM user_tokens
      WHERE user_id = ? AND token_name = ?
    `);

    stmt.run(userId, tokenName);
    return true;
  } catch (error) {
    console.error('Error deleting user token:', error);
    return false;
  }
}

/**
 * Get all token names for a user (without decrypting)
 */
export function getUserTokenList(userId: number): Array<{ token_name: string; token_type: string; created_at: string }> {
  try {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT token_name, token_type, created_at
      FROM user_tokens
      WHERE user_id = ?
    `);

    return stmt.all(userId) as any[];
  } catch (error) {
    console.error('Error getting user token list:', error);
    return [];
  }
}
