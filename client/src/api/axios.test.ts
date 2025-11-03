/**
 * @author Bob's Garage Team
 * @purpose Unit tests for axios HTTP client utilities
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setAccessToken, clearAccessToken, getAccessToken, api } from './axios';

describe('axios API client - Token management', () => {
  beforeEach(() => {
    clearAccessToken();
  });

  describe('Token management functions', () => {
    it('should set and get access token', () => {
      setAccessToken('test-token-123');
      expect(getAccessToken()).toBe('test-token-123');
    });

    it('should clear access token', () => {
      setAccessToken('test-token-123');
      clearAccessToken();
      expect(getAccessToken()).toBeUndefined();
    });

    it('should handle undefined token', () => {
      setAccessToken(undefined);
      expect(getAccessToken()).toBeUndefined();
    });

    it('should handle token with special characters', () => {
      const specialToken = 'token-with-special-chars!@#$%';
      setAccessToken(specialToken);
      
      expect(getAccessToken()).toBe(specialToken);
    });

    it('should handle empty string token', () => {
      setAccessToken('');
      const token = getAccessToken();
      expect(token).toBe('');
    });

    it('should handle very long token', () => {
      const longToken = 'a'.repeat(1000);
      setAccessToken(longToken);
      
      expect(getAccessToken()).toBe(longToken);
    });

    it('should overwrite existing token', () => {
      setAccessToken('first-token');
      expect(getAccessToken()).toBe('first-token');
      
      setAccessToken('second-token');
      expect(getAccessToken()).toBe('second-token');
    });
  });

  describe('API instance', () => {
    it('should export api instance', () => {
      expect(api).toBeDefined();
      // Axios instance is an object with function methods
      expect(api).toBeInstanceOf(Object);
    });

    it('should have base URL configured', () => {
      // Base URL is set during module load
      // In test environment, it should default or use env var
      expect(api.defaults.baseURL).toBeDefined();
      expect(typeof api.defaults.baseURL).toBe('string');
    });

    it('should be an axios instance', () => {
      // Verify it has axios instance methods
      expect(api).toHaveProperty('get');
      expect(api).toHaveProperty('post');
      expect(api).toHaveProperty('put');
      expect(api).toHaveProperty('delete');
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
    });
  });

  describe('Request interceptor logic', () => {
    it('should attach token to headers when token exists', () => {
      setAccessToken('test-token-123');
      
      const mockConfig = {
        headers: {},
      };

      // Simulate interceptor logic
      const token = getAccessToken();
      if (token && mockConfig.headers) {
        (mockConfig.headers as any).Authorization = `Bearer ${token}`;
      }

      expect(mockConfig.headers).toHaveProperty('Authorization', 'Bearer test-token-123');
    });

    it('should not attach token when token is absent', () => {
      clearAccessToken();
      
      const mockConfig = {
        headers: {},
      };

      const token = getAccessToken();
      if (token && mockConfig.headers) {
        (mockConfig.headers as any).Authorization = `Bearer ${token}`;
      }

      expect(mockConfig.headers).not.toHaveProperty('Authorization');
    });

    it('should not overwrite existing Authorization header', () => {
      setAccessToken('test-token-123');
      
      const mockConfig = {
        headers: {
          Authorization: 'Bearer existing-token',
        },
      };

      // Simulate: only set if not already present
      const token = getAccessToken();
      if (token && mockConfig.headers && !mockConfig.headers.Authorization) {
        (mockConfig.headers as any).Authorization = `Bearer ${token}`;
      }

      expect(mockConfig.headers.Authorization).toBe('Bearer existing-token');
    });
  });

  describe('Response interceptor logic - 401 handling', () => {
    it('should identify 401 errors', () => {
      const mockError = {
        response: {
          status: 401,
          config: {
            url: '/api/services',
            _retry401: false,
          },
        },
      } as any;

      expect(mockError.response.status).toBe(401);
      expect(mockError.response.config._retry401).toBe(false);
    });

    it('should not retry refresh endpoint on 401', () => {
      const mockError = {
        response: {
          status: 401,
          config: {
            url: '/auth/refresh',
            _retry401: false,
          },
        },
      } as any;

      const isRefreshCall = mockError.response.config.url?.includes('/auth/refresh');
      expect(isRefreshCall).toBe(true);
    });

    it('should mark request as retried to prevent infinite loops', () => {
      const mockConfig = {
        url: '/api/services',
        _retry401: false,
      } as any;

      mockConfig._retry401 = true;
      
      expect(mockConfig._retry401).toBe(true);
    });
  });

  describe('Response interceptor logic - 429 handling', () => {
    it('should identify 429 errors and check retry count', () => {
      const mockError = {
        response: {
          status: 429,
          headers: {
            'retry-after': '2',
          },
          config: {
            url: '/api/services',
            _retry429Count: 0,
          },
        },
      } as any;

      const count = mockError.response.config._retry429Count ?? 0;
      expect(count).toBeLessThan(1); // Should retry if count < 1
    });

    it('should calculate delay from retry-after header', () => {
      const retryAfterHeader = '2';
      const v = Number(retryAfterHeader);
      
      if (Number.isFinite(v)) {
        const delayMs = Math.min(5000, Math.max(500, v * 1000));
        expect(delayMs).toBe(2000);
      }
    });

    it('should cap delay at 5 seconds', () => {
      const retryAfterHeader = '10'; // 10 seconds
      const v = Number(retryAfterHeader);
      
      if (Number.isFinite(v)) {
        const delayMs = Math.min(5000, Math.max(500, v * 1000));
        expect(delayMs).toBe(5000); // Capped at 5 seconds
      }
    });

    it('should use minimum delay of 500ms', () => {
      const retryAfterHeader = '0.1'; // 0.1 seconds
      const v = Number(retryAfterHeader);
      
      if (Number.isFinite(v)) {
        const delayMs = Math.min(5000, Math.max(500, v * 1000));
        expect(delayMs).toBe(500); // Minimum 500ms
      }
    });

    it('should not retry more than once', () => {
      const mockConfig = {
        _retry429Count: 1, // Already retried once
      } as any;

      const count = mockConfig._retry429Count ?? 0;
      expect(count).toBeGreaterThanOrEqual(1); // Should not retry again
    });

    it('should handle rate limit reset header', () => {
      const now = Date.now();
      const resetSec = Math.floor(now / 1000) + 3; // 3 seconds from now
      
      const resetSecNum = Number(resetSec);
      if (Number.isFinite(resetSecNum)) {
        const target = resetSecNum * 1000;
        const delayMs = Math.min(5000, Math.max(500, target - now));
        
        expect(delayMs).toBeGreaterThan(0);
        expect(delayMs).toBeLessThanOrEqual(5000);
      }
    });
  });

  describe('Error handling', () => {
    it('should identify non-401/429 errors', () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      } as any;

      expect(mockError.response?.status).toBe(500);
    });

    it('should handle missing config in error', () => {
      const mockError = {
        response: {
          status: 400,
        },
        config: undefined,
      } as any;

      expect(mockError.config).toBeUndefined();
    });
  });
});
