/**
 * @author Bob's Garage Team
 * @purpose Standardized query state management for loading/error/empty states
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import Loading from '../components/ui/Loading';

interface UseQueryStateOptions {
  isLoading: boolean;
  error: Error | null;
  data: unknown;
  isEmpty?: (data: unknown) => boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

type QueryState = 'loading' | 'error' | 'empty' | 'success';

/**
 * Handles standardized query states (loading, error, empty, success)
 */
export function useQueryState(options: UseQueryStateOptions) {
  const { isLoading, error, data, isEmpty, emptyMessage, loadingMessage, onRetry, showRetry } = options;

  const state = useMemo<QueryState>(() => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (isEmpty && data && isEmpty(data)) return 'empty';
    if (!data) return 'empty';
    return 'success';
  }, [isLoading, error, data, isEmpty]);

  const content = useMemo(() => {
    if (state === 'loading') {
      return <Loading message={loadingMessage || 'Loading...'} />;
    }

    if (state === 'error') {
      return (
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <div>Failed to load data</div>
          {showRetry && onRetry && (
            <Button size="sm" variant="outline-light" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      );
    }

    if (state === 'empty') {
      return <div className="text-muted">{emptyMessage || 'No data available'}</div>;
    }

    return null;
  }, [state, loadingMessage, emptyMessage, showRetry, onRetry]);

  return {
    state,
    content,
    isLoading: state === 'loading',
    isError: state === 'error',
    isEmpty: state === 'empty',
    isSuccess: state === 'success',
  };
}

export default useQueryState;

