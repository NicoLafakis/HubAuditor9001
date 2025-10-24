import CryptoJS from 'crypto-js';

// Get encryption key from environment variable
// In production, this should be a strong, randomly generated key
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return key;
}

/**
 * Encrypts a token using AES encryption
 */
export function encryptToken(token: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(token, getEncryptionKey()).toString();
    return encrypted;
  } catch (error) {
    console.error('Error encrypting token:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypts a token using AES decryption
 */
export function decryptToken(encryptedToken: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedToken, getEncryptionKey());
    const token = decrypted.toString(CryptoJS.enc.Utf8);

    if (!token) {
      throw new Error('Decryption resulted in empty string');
    }

    return token;
  } catch (error) {
    console.error('Error decrypting token:', error);
    throw new Error('Failed to decrypt token');
  }
}
