/**
 * @author Bob's Garage Team
 * @purpose Unit tests for useForm hook
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useForm } from './useForm';

// Mock ToastProvider
const mockNotify = vi.fn();
vi.mock('../components/ui/ToastProvider', () => ({
  useToast: () => ({ notify: mockNotify }),
}));

describe('useForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  interface TestFormData {
    email: string;
    password: string;
    age?: number;
  }

  const defaultValues: TestFormData = {
    email: '',
    password: '',
    age: 0,
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit: async () => {},
      }),
    );

    expect(result.current.values).toEqual(defaultValues);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.fieldErrors).toEqual({});
  });

  it('should update single value with setValue', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit: async () => {},
      }),
    );

    act(() => {
      result.current.setValue('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.values.password).toBe('');
  });

  it('should update multiple values with setValues', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit: async () => {},
      }),
    );

    act(() => {
      result.current.setValues({ email: 'test@example.com', password: 'secret123' });
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.values.password).toBe('secret123');
  });

  it('should handle successful form submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        defaultValues: { email: 'test@example.com', password: 'secret' },
        onSubmit,
        onSuccess,
        successMessage: 'Form submitted!',
      }),
    );

    await act(async () => {
      const formEvent = { preventDefault: vi.fn() } as any;
      await result.current.handleSubmit(formEvent);
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com', password: 'secret' });
      expect(onSuccess).toHaveBeenCalled();
      expect(mockNotify).toHaveBeenCalledWith({
        title: 'Success',
        body: 'Form submitted!',
        variant: 'success',
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });
  });

  it('should handle form submission errors', async () => {
    const errorMessage = 'Server error occurred';
    const onSubmit = vi.fn().mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit,
      }),
    );

    await act(async () => {
      const formEvent = { preventDefault: vi.fn() } as any;
      await result.current.handleSubmit(formEvent);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(mockNotify).toHaveBeenCalledWith({
        body: errorMessage,
        variant: 'danger',
      });
    });
  });

  it('should handle non-Error exceptions', async () => {
    const onSubmit = vi.fn().mockRejectedValue('String error');

    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit,
      }),
    );

    await act(async () => {
      const formEvent = { preventDefault: vi.fn() } as any;
      await result.current.handleSubmit(formEvent);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Operation failed');
      expect(mockNotify).toHaveBeenCalledWith({
        body: 'Operation failed',
        variant: 'danger',
      });
    });
  });

  it('should run validation before submission', async () => {
    const validate = vi.fn().mockReturnValue({
      isValid: false,
      errors: { email: 'Email is required' },
    });
    const onSubmit = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit,
        validate,
      }),
    );

    await act(async () => {
      const formEvent = { preventDefault: vi.fn() } as any;
      await result.current.handleSubmit(formEvent);
    });

    await waitFor(() => {
      expect(validate).toHaveBeenCalledWith(defaultValues);
      expect(result.current.fieldErrors).toEqual({ email: 'Email is required' });
      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should proceed with submission when validation passes', async () => {
    const validate = vi.fn().mockReturnValue({ isValid: true });
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useForm({
        defaultValues: { email: 'test@example.com', password: 'secret' },
        onSubmit,
        validate,
      }),
    );

    await act(async () => {
      const formEvent = { preventDefault: vi.fn() } as any;
      await result.current.handleSubmit(formEvent);
    });

    await waitFor(() => {
      expect(validate).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalled();
      expect(result.current.fieldErrors).toEqual({});
    });
  });

  it('should reset form to default values', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit: async () => {},
      }),
    );

    act(() => {
      result.current.setValue('email', 'modified@example.com');
      result.current.setFieldError('email', 'Error message');
      result.current.setValue('password', 'modified');
    });

    expect(result.current.values.email).toBe('modified@example.com');

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(defaultValues);
    expect(result.current.error).toBeUndefined();
    expect(result.current.fieldErrors).toEqual({});
  });

  it('should set field errors manually', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit: async () => {},
      }),
    );

    act(() => {
      result.current.setFieldError('email', 'Invalid email format');
    });

    expect(result.current.fieldErrors.email).toBe('Invalid email format');
  });

  it('should clear errors and fieldErrors on new submission attempt', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit,
      }),
    );

    // Set error state manually
    act(() => {
      result.current.setFieldError('email', 'Previous error');
      // We can't directly set error, but we can trigger it via failed submission
    });

    // Submit successfully
    await act(async () => {
      const formEvent = { preventDefault: vi.fn() } as any;
      await result.current.handleSubmit(formEvent);
    });

    await waitFor(() => {
      expect(result.current.fieldErrors).toEqual({});
      expect(result.current.error).toBeUndefined();
    });
  });

  it('should set loading state during submission', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    const onSubmit = vi.fn().mockReturnValue(submitPromise);

    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit,
      }),
    );

    const formEvent = { preventDefault: vi.fn() } as any;
    
    act(() => {
      result.current.handleSubmit(formEvent);
    });

    // Should be loading
    expect(result.current.loading).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolveSubmit!();
      await submitPromise;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should call onSuccess callback when provided and submission succeeds', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit,
        onSuccess,
      }),
    );

    await act(async () => {
      const formEvent = { preventDefault: vi.fn() } as any;
      await result.current.handleSubmit(formEvent);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should not call onSuccess or show success message on error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Failed'));
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        defaultValues,
        onSubmit,
        onSuccess,
        successMessage: 'Should not show',
      }),
    );

    await act(async () => {
      const formEvent = { preventDefault: vi.fn() } as any;
      await result.current.handleSubmit(formEvent);
    });

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockNotify).not.toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'success' }),
      );
    });
  });
});

