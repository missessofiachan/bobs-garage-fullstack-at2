import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth.slice';
import favoritesReducer from '../slices/favorites.slice';
import preferencesReducer from '../slices/preferences.slice';

export const store = configureStore({
  reducer: { auth: authReducer, favorites: favoritesReducer, preferences: preferencesReducer }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
