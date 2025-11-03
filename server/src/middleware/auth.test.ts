/**
 * @author Bob's Garage Team
 * @purpose Unit tests for authentication middleware
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../types/global.d.js';
import { requireAuth, requireAdmin } from './auth.js';

// Mock JWT utilities
vi.mock('../utils/jwt.js', () => ({
  verifyToken: vi.fn(),
}));

import { verifyToken } from '../utils/jwt.js';

const mockVerifyToken = verifyToken as ReturnType<typeof vi.fn>;

describe('requireAuth', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should call next() when valid token is provided', () => {
    const payload: JwtPayload = { sub: 123, role: 'user' };
    mockReq.headers = { authorization: 'Bearer valid-token' };
    mockVerifyToken.mockReturnValue(payload);

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
    expect((mockReq as any).user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header is missing', () => {
    mockReq.headers = {};

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header is empty string', () => {
    mockReq.headers = { authorization: '' };

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing token' });
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    mockReq.headers = { authorization: 'Invalid token' };

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing token' });
  });

  it('should extract token correctly from Bearer header', () => {
    const payload: JwtPayload = { sub: 456, role: 'admin' };
    mockReq.headers = { authorization: 'Bearer my-access-token' };
    mockVerifyToken.mockReturnValue(payload);

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockVerifyToken).toHaveBeenCalledWith('my-access-token');
    expect((mockReq as any).user).toEqual(payload);
  });

  it('should handle token with spaces in Bearer format', () => {
    const payload: JwtPayload = { sub: 789, role: 'user' };
    mockReq.headers = { authorization: 'Bearer token-with-spaces' };
    mockVerifyToken.mockReturnValue(payload);

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockVerifyToken).toHaveBeenCalledWith('token-with-spaces');
  });

  it('should return 401 when token verification fails', () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token is expired', () => {
    mockReq.headers = { authorization: 'Bearer expired-token' };
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Token expired');
    });

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
  });

  it('should attach payload to req.user', () => {
    const payload: JwtPayload = {
      sub: 999,
      role: 'admin',
      email: 'admin@example.com',
      iat: 1234567890,
      exp: 1234571490,
    };
    mockReq.headers = { authorization: 'Bearer valid-token' };
    mockVerifyToken.mockReturnValue(payload);

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq as any).user).toEqual(payload);
    expect((mockReq as any).user?.sub).toBe(999);
    expect((mockReq as any).user?.role).toBe('admin');
  });

  it('should handle case-insensitive Bearer keyword', () => {
    // Actually, the code uses .startsWith('Bearer ') which is case-sensitive
    // But let's test that lowercase doesn't work (current implementation)
    mockReq.headers = { authorization: 'bearer lowercase-token' };

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing token' });
  });
});

describe('requireAdmin', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next() when user is admin', () => {
    (mockReq as any).user = { sub: 123, role: 'admin' };

    requireAdmin(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not set', () => {
    (mockReq as any).user = undefined;

    requireAdmin(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Missing authentication',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when user role is not admin', () => {
    (mockReq as any).user = { sub: 123, role: 'user' };

    requireAdmin(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Forbidden: admin only',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 for empty string role', () => {
    (mockReq as any).user = { sub: 123, role: '' };

    requireAdmin(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 for undefined role', () => {
    (mockReq as any).user = { sub: 123 };

    requireAdmin(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow admin role with additional properties', () => {
    (mockReq as any).user = {
      sub: 456,
      role: 'admin',
      email: 'admin@example.com',
      iat: 1234567890,
    };

    requireAdmin(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should handle case-sensitive role check', () => {
    (mockReq as any).user = { sub: 123, role: 'Admin' }; // Capital A

    requireAdmin(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

