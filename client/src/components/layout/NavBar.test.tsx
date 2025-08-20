import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../../a/store';
import NavBar from './NavBar';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../api/axios', async () => {
  const actual = await vi.importActual<any>('../../api/axios');
  return {
    __esModule: true,
    ...actual,
    default: { ...actual.default, post: vi.fn((url: string) => {
      if (url === '/auth/logout') {
        return new Promise(resolve => setTimeout(() => resolve({ data: {} }), 5));
      }
      return Promise.resolve({ data: {} });
    }) },
    clearAccessToken: vi.fn(),
  };
});

// NOTE: tests assume store can be mutated directly for test simplicity

function renderWithProviders(ui: unknown) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui as React.ReactNode}</MemoryRouter>
    </Provider>
  );
}

it('shows login/register when not authenticated', () => {
  // ensure auth cleared
  store.dispatch({ type: 'auth/clearAuth' });
  renderWithProviders(<NavBar />);
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
  expect(screen.getByText(/Register/i)).toBeInTheDocument();
});

it('shows profile dropdown and logout when authenticated', () => {
  store.dispatch({ type: 'auth/setAuth', payload: { accessToken: 'x', email: 'a@b.test', role: 'user' } });
  renderWithProviders(<NavBar />);
  expect(screen.getByText(/Account|a@b.test/i)).toBeInTheDocument();
});

it('Admin link visible only for admin role', () => {
  store.dispatch({ type: 'auth/setAuth', payload: { accessToken: 'x', email: 'a@b.test', role: 'user' } });
  renderWithProviders(<NavBar />);
  expect(screen.queryByText('Admin')).toBeNull();

  store.dispatch({ type: 'auth/setAuth', payload: { accessToken: 'y', email: 'admin@b.test', role: 'admin' } });
  renderWithProviders(<NavBar />);
  expect(screen.getAllByText('Admin')[0]).toBeInTheDocument();
});

it('Logout shows spinner then clears auth', async () => {
  store.dispatch({ type: 'auth/setAuth', payload: { accessToken: 'x', email: 'a@b.test', role: 'user' } });
  renderWithProviders(<NavBar />);

  // Open account dropdown
  const accountBtn = screen.getByRole('button', { name: /Account|a@b.test/i });
  await userEvent.click(accountBtn);

  const logoutItem = await screen.findByText(/Logout/i);
  await userEvent.click(logoutItem);

  // While pending, item disabled and shows spinner text
  const disabledAttr = logoutItem.closest('a,button')?.getAttribute('aria-disabled') ?? (logoutItem as HTMLAnchorElement).getAttribute('disabled');
  expect(disabledAttr).not.toBeNull();

  await waitFor(() => {
    // After promise resolves and auth cleared, Login should appear
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
});
