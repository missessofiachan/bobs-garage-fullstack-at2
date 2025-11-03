/**
 * @author Bob's Garage Team
 * @purpose Unit tests for JWT utilities
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { signAccessToken, signRefreshToken, verifyToken, verifyRefreshToken } from './jwt.js';

// Mock env config
vi.mock('../config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-access-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_EXPIRES_IN: '1h',
    REFRESH_EXPIRES_IN: '7d',
  },
}));

describe('signAccessToken', () => {
  it('should sign a token with the correct payload', () => {
    const payload = { sub: 123, role: 'user', email: 'test@example.com' };
    const token = signAccessToken(payload);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    // Decode without verification to check payload
    const decoded = jwt.decode(token) as any;
    expect(decoded.sub).toBe(123);
    expect(decoded.role).toBe('user');
    expect(decoded.email).toBe('test@example.com');
  });

  it('should create different tokens for different payloads', () => {
    const payload1 = { sub: 1, role: 'user' };
    const payload2 = { sub: 2, role: 'admin' };
    
    const token1 = signAccessToken(payload1);
    const token2 = signAccessToken(payload2);
    
    expect(token1).not.toBe(token2);
  });

  it('should include expiration in token', () => {
    const payload = { sub: 123 };
    const token = signAccessToken(payload);
    
    const decoded = jwt.decode(token) as any;
    expect(decoded.exp).toBeDefined();
    expect(typeof decoded.exp).toBe('number');
  });
});

describe('signRefreshToken', () => {
  it('should sign a refresh token with the correct payload', () => {
    const payload = { sub: 123, role: 'user' };
    const token = signRefreshToken(payload);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    const decoded = jwt.decode(token) as any;
    expect(decoded.sub).toBe(123);
    expect(decoded.role).toBe('user');
  });

  it('should use refresh secret when configured', () => {
    const payload = { sub: 123 };
    const token = signRefreshToken(payload);
    
    // Verify it was signed with refresh secret
    expect(() => verifyRefreshToken<typeof payload>(token)).not.toThrow();
  });
});

describe('verifyToken', () => {
  it('should verify a valid access token', () => {
    const payload = { sub: 123, role: 'user', email: 'test@example.com' };
    const token = signAccessToken(payload);
    
    const verified = verifyToken<typeof payload>(token);
    expect(verified.sub).toBe(123);
    expect(verified.role).toBe('user');
    expect(verified.email).toBe('test@example.com');
  });

  it('should throw for invalid token', () => {
    const invalidToken = 'invalid.token.here';
    
    expect(() => {
      verifyToken(invalidToken);
    }).toThrow();
  });

  it('should throw for malformed token', () => {
    const malformedToken = 'not-a-jwt-token';
    
    expect(() => {
      verifyToken(malformedToken);
    }).toThrow();
  });

  it('should throw for token signed with wrong secret', () => {
    const wrongSecretToken = jwt.sign({ sub: 123 }, 'wrong-secret');
    
    expect(() => {
      verifyToken(wrongSecretToken);
    }).toThrow();
  });

  it('should throw for expired token', () => {
    const expiredPayload = { sub: 123 };
    const expiredToken = jwt.sign(expiredPayload, 'test-access-secret', { expiresIn: '-1h' });
    
    expect(() => {
      verifyToken(expiredToken);
    }).toThrow();
  });
});

describe('verifyRefreshToken', () => {
  it('should verify a valid refresh token', () => {
    const payload = { sub: 123, role: 'user' };
    const token = signRefreshToken(payload);
    
    const verified = verifyRefreshToken<typeof payload>(token);
    expect(verified.sub).toBe(123);
    expect(verified.role).toBe('user');
  });

  it('should throw for invalid refresh token', () => {
    const invalidToken = 'invalid.refresh.token';
    
    expect(() => {
      verifyRefreshToken(invalidToken);
    }).toThrow();
  });

  it('should throw for refresh token signed with access secret', () => {
    // Sign with access secret but try to verify as refresh token
    const wrongToken = jwt.sign({ sub: 123 }, 'test-access-secret', { expiresIn: '7d' });
    
    expect(() => {
      verifyRefreshToken(wrongToken);
    }).toThrow();
  });
});

