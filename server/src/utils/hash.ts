/**
 * @author Bob's Garage Team
 * @purpose Password hashing and verification utilities using bcrypt
 * @version 1.0.0
 */

// bcrypt hash/compare
import bcrypt from 'bcrypt';

/**
 * Hash a password using bcrypt with cost factor of 12
 *
 * @param p - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export const hashPassword = (p: string) => bcrypt.hash(p, 12);

/**
 * Verify a password against a hash
 *
 * @param p - Plain text password to verify
 * @param h - Hashed password to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);
