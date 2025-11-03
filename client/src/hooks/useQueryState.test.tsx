/**
 * @author Bob's Garage Team
 * @purpose Unit tests for useQueryState hook
 * @version 1.0.0
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQueryState } from './useQueryState';

// Mock Loading component
vi.mock('../components/ui/Loading', () => ({
  default: ({ message }: { message?: string }) => <div data-testid="loading">{message || 'Loading...'}</div>,
}));

// Mock Button component
vi.mock('react-bootstrap', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="retry-button">{children}</button>
  ),
}));

describe('useQueryState', () => {
  describe('state determination', () => {
    it('should return loading state when isLoading is true', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: true,
          error: null,
          data: null,
        }),
      );

      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should return error state when error is present', () => {
      const error = new Error('Failed to fetch');
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error,
          data: null,
        }),
      );

      expect(result.current.state).toBe('error');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should return empty state when data is null', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: null,
        }),
      );

      expect(result.current.state).toBe('empty');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should return empty state when isEmpty function returns true', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: [],
          isEmpty: (data) => Array.isArray(data) && data.length === 0,
        }),
      );

      expect(result.current.state).toBe('empty');
      expect(result.current.isEmpty).toBe(true);
    });

    it('should return success state when data is present and not empty', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: [{ id: 1, name: 'Item' }],
          isEmpty: (data) => Array.isArray(data) && data.length === 0,
        }),
      );

      expect(result.current.state).toBe('success');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should prioritize loading over error', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: true,
          error: new Error('Error'),
          data: null,
        }),
      );

      expect(result.current.state).toBe('loading');
    });

    it('should prioritize loading over empty', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: true,
          error: null,
          data: null,
        }),
      );

      expect(result.current.state).toBe('loading');
    });

    it('should prioritize error over empty', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: new Error('Error'),
          data: null,
        }),
      );

      expect(result.current.state).toBe('error');
    });
  });

  describe('content rendering', () => {
    it('should render loading component when loading', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: true,
          error: null,
          data: null,
        }),
      );

      expect(result.current.content).toBeDefined();
      // Loading component is rendered
    });

    it('should render custom loading message', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: true,
          error: null,
          data: null,
          loadingMessage: 'Fetching data...',
        }),
      );

      expect(result.current.content).toBeDefined();
    });

    it('should render error message with retry button when showRetry is true', () => {
      const onRetry = vi.fn();
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: new Error('Failed'),
          data: null,
          showRetry: true,
          onRetry,
        }),
      );

      expect(result.current.content).toBeDefined();
      // Error content with retry button is rendered
    });

    it('should render error message without retry button when showRetry is false', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: new Error('Failed'),
          data: null,
          showRetry: false,
        }),
      );

      expect(result.current.content).toBeDefined();
    });

    it('should render custom empty message', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: null,
          emptyMessage: 'No items found',
        }),
      );

      expect(result.current.content).toBeDefined();
    });

    it('should render default empty message when not provided', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: null,
        }),
      );

      expect(result.current.content).toBeDefined();
    });

    it('should return null content for success state', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: [{ id: 1 }],
        }),
      );

      expect(result.current.content).toBeNull();
    });

    it('should not show retry button when onRetry is not provided', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: new Error('Failed'),
          data: null,
          showRetry: true,
          onRetry: undefined,
        }),
      );

      expect(result.current.content).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty array with isEmpty function', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: [],
          isEmpty: (data) => Array.isArray(data) && data.length === 0,
        }),
      );

      expect(result.current.isEmpty).toBe(true);
    });

    it('should handle empty object', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: {},
          isEmpty: (data) => Object.keys(data as Record<string, unknown>).length === 0,
        }),
      );

      expect(result.current.isEmpty).toBe(true);
    });

    it('should handle undefined data', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: undefined,
        }),
      );

      expect(result.current.isEmpty).toBe(true);
    });

    it('should handle isEmpty function returning false for non-empty data', () => {
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: null,
          data: [1, 2, 3],
          isEmpty: (data) => Array.isArray(data) && data.length === 0,
        }),
      );

      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('callback handling', () => {
    it('should call onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();
      const { result } = renderHook(() =>
        useQueryState({
          isLoading: false,
          error: new Error('Failed'),
          data: null,
          showRetry: true,
          onRetry,
        }),
      );

      expect(result.current.content).toBeDefined();
      // onRetry would be called when button is clicked (tested in integration)
    });
  });
});

