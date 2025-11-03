/**
 * @author Bob's Garage Team
 * @purpose Unit tests for validation middleware
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validateBody } from './validate.js';

describe('validateBody', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next() when validation passes', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const middleware = validateBody(schema);
    mockReq.body = { email: 'test@example.com', password: 'password123' };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should parse and attach validated body to req.body', () => {
    const schema = z.object({
      name: z.string(),
      age: z.coerce.number(),
    });

    const middleware = validateBody(schema);
    mockReq.body = { name: 'John', age: '25' };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((mockReq as any).body.age).toBe(25); // Coerced to number
    expect((mockReq as any).body.name).toBe('John');
  });

  it('should return 400 with Zod error issues when validation fails', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const middleware = validateBody(schema);
    mockReq.body = { email: 'invalid-email', password: 'short' };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Validation error',
      errors: expect.any(Array),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 with generic message for non-Zod errors', () => {
    // Create a schema that might throw a non-Zod error
    const schema = z.object({
      data: z.string().transform(() => {
        throw new Error('Custom error');
      }),
    });

    const middleware = validateBody(schema);
    mockReq.body = { data: 'test' };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Invalid request body',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle nested object validation', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      settings: z.object({
        theme: z.enum(['light', 'dark']),
      }),
    });

    const middleware = validateBody(schema);
    mockReq.body = {
      user: { name: 'John', email: 'john@example.com' },
      settings: { theme: 'dark' },
    };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle optional fields', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email().optional(),
    });

    const middleware = validateBody(schema);
    mockReq.body = { name: 'John' };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle array validation', () => {
    const schema = z.object({
      items: z.array(z.string()),
    });

    const middleware = validateBody(schema);
    mockReq.body = { items: ['item1', 'item2', 'item3'] };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle number coercion', () => {
    const schema = z.object({
      id: z.coerce.number(),
      price: z.coerce.number(),
    });

    const middleware = validateBody(schema);
    mockReq.body = { id: '123', price: '99.99' };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((mockReq as any).body.id).toBe(123);
    expect((mockReq as any).body.price).toBe(99.99);
  });

  it('should handle boolean validation', () => {
    const schema = z.object({
      active: z.boolean(),
      published: z.boolean().default(true),
    });

    const middleware = validateBody(schema);
    mockReq.body = { active: true };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

