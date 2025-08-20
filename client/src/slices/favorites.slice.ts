import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const LS_KEY = 'favorites:v1';

type FavoritesState = { items: number[] };

function load(): FavoritesState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as FavoritesState;
  } catch {
    // ignore read errors (SSR or storage disabled)
  }
  return { items: [] };
}

function save(state: FavoritesState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: load(),
  reducers: {
    addFavorite: (state, action: PayloadAction<number>) => {
      if (!state.items.includes(action.payload)) {
        state.items.push(action.payload);
        save(state);
      }
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(id => id !== action.payload);
      save(state);
    },
    clearFavorites: (state) => {
      state.items = [];
      save(state);
    }
  }
});

export const { addFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
