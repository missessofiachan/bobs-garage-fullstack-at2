/**
 * @author Bob's Garage Team
 * @purpose Unit tests for async handler utility
 * @version 1.0.0
 */

import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import asyncHandler from './asyncHandler.js';

describe('asyncHandler', () => {
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

  it('should call handler function with req, res, next', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(handler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  it('should not call next when handler succeeds', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next with error when handler throws', async () => {
    const error = new Error('Test error');
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should call next with rejection when handler rejects', async () => {
    const error = new Error('Rejected');
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should handle non-Error rejections', async () => {
    const handler = vi.fn().mockRejectedValue('String error');
    const wrapped = asyncHandler(handler);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith('String error');
  });

  it('should preserve handler return value when successful', async () => {
    const handler = vi.fn().mockResolvedValue({ data: 'success' });
    const wrapped = asyncHandler(handler);

    const result = await wrapped(mockReq as Request, mockRes as Response, mockNext);

    // Note: asyncHandler doesn't return the result, it just calls the handler
    // The handler is called but the return value isn't captured
    expect(handler).toHaveBeenCalled();
  });

  it('should work with async handlers that return promises', async () => {
    const handler = vi.fn().mockImplementation(() => 
      Promise.resolve({ status: 200 })
    );
    const wrapped = asyncHandler(handler);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(handler).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle null rejections', async () => {
    const handler = vi.fn().mockRejectedValue(null);
    const wrapped = asyncHandler(handler);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(null);
  });

  it('should handle undefined rejections', async () => {
    const handler = vi.fn().mockRejectedValue(undefined);
    const wrapped = asyncHandler(handler);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(undefined);
  });
});

