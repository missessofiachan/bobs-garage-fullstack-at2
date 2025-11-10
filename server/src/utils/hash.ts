/**
 * @author Bob's Garage Team
 * @purpose Password hashing and verification utilities using bcrypt
 * @version 1.0.0
 */

// bcrypt hash/compare
import bcrypt from 'bcrypt';
export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);
