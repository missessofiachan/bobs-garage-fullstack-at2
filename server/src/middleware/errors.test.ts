/**
 * @author Bob's Garage Team
 * @purpose Unit tests for error middleware
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { notFound, errorHandler } from './errors.js';

describe('notFound', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  it('should return 404 with Not Found message', () => {
    notFound(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Not Found',
    });
  });

  it('should be callable with any request', () => {
    const req1 = {} as Request;
    const req2 = { url: '/some/path' } as Request;

    notFound(req1, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(404);

    vi.clearAllMocks();

    notFound(req2, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });
});

describe('errorHandler', () => {
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

  it('should return 500 with internal server error message', () => {
    const error = new Error('Some error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should not leak error details in production', () => {
    const error = new Error('Database connection failed');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
    // Should not include error.message or error.stack
    const jsonCall = (mockRes.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall).not.toHaveProperty('error');
    expect(jsonCall).not.toHaveProperty('stack');
  });

  it('should handle non-Error objects', () => {
    const error = { message: 'String error' };

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });

  it('should handle null errors', () => {
    errorHandler(null, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });

  it('should handle undefined errors', () => {
    errorHandler(undefined, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });

  it('should handle string errors', () => {
    errorHandler('String error', mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });

  it('should not call next()', () => {
    const error = new Error('Test error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
  });
});

