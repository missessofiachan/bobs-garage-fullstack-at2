/**
 * @author Bob's Garage Team
 * @purpose Tests for ProtectedRoute and AdminRoute components
 * @version 1.0.0
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute, AdminRoute } from './ProtectedRoute';
import authReducer from '../slices/auth.slice';

// Mock react-router-dom Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
  };
});

describe('ProtectedRoute', () => {
  const createStore = (accessToken: string | undefined) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          accessToken,
          role: 'user',
          email: 'user@example.com',
        },
      },
    });
  };

  it('should render children when user is authenticated', () => {
    const store = createStore('valid-token');
    const { getByText } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to /login when user is not authenticated', () => {
    const store = createStore(undefined);
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    const navigate = getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/login');
  });

  it('should redirect when accessToken is empty string', () => {
    const store = createStore('');
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    const navigate = getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/login');
  });
});

describe('AdminRoute', () => {
  const createStore = (accessToken: string | undefined, role: 'user' | 'admin' = 'user') => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          accessToken,
          role,
          email: 'user@example.com',
        },
      },
    });
  };

  it('should render children when user is admin', () => {
    const store = createStore('valid-token', 'admin');
    const { getByText } = render(
      <Provider store={store}>
        <BrowserRouter>
          <AdminRoute>
            <div>Admin Content</div>
          </AdminRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(getByText('Admin Content')).toBeInTheDocument();
  });

  it('should redirect to /login when user is not authenticated', () => {
    const store = createStore(undefined);
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <AdminRoute>
            <div>Admin Content</div>
          </AdminRoute>
        </BrowserRouter>
      </Provider>
    );

    const navigate = getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/login');
  });

  it('should redirect to / when user is not admin', () => {
    const store = createStore('valid-token', 'user');
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <AdminRoute>
            <div>Admin Content</div>
          </AdminRoute>
        </BrowserRouter>
      </Provider>
    );

    const navigate = getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/');
  });

  it('should redirect to / when role is undefined', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          accessToken: 'valid-token',
          role: undefined as any,
          email: 'user@example.com',
        },
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <AdminRoute>
            <div>Admin Content</div>
          </AdminRoute>
        </BrowserRouter>
      </Provider>
    );

    const navigate = getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/');
  });
});

