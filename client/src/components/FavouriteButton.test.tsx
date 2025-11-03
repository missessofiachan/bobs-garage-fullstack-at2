/**
 * @author Bob's Garage Team
 * @purpose Component tests for FavouriteButton
 * @version 1.0.0
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FavouriteButton from './FavouriteButton';
import favoritesReducer from '../slices/favorites.slice';

// Mock framer-motion to avoid animation delays in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
  };
});

describe('FavouriteButton', () => {
  const createStore = (initialFavorites: number[] = []) => {
    return configureStore({
      reducer: {
        favorites: favoritesReducer,
      },
      preloadedState: {
        favorites: { items: initialFavorites },
      },
    });
  };

  it('should render unfavorited state by default', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FavouriteButton id={1} />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /add to favourites/i });
    expect(button).toBeInTheDocument();
  });

  it('should render favorited state when item is favorited', () => {
    const store = createStore([1]);
    render(
      <Provider store={store}>
        <FavouriteButton id={1} />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /remove from favourites/i });
    expect(button).toBeInTheDocument();
  });

  it('should toggle favorite on click', async () => {
    const store = createStore();
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <FavouriteButton id={1} />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /add to favourites/i });
    expect(button).toBeInTheDocument();

    await user.click(button);

    const removeButton = screen.getByRole('button', { name: /remove from favourites/i });
    expect(removeButton).toBeInTheDocument();
  });
});

