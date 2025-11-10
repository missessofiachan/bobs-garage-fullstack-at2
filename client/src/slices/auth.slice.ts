import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type AuthState = {
  accessToken?: string;
  role?: 'user' | 'admin';
  email?: string;
};
const initial: AuthState = {};

const slice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    setAuth: (s, a: PayloadAction<AuthState>) => Object.assign(s, a.payload),
    clearAuth: (s) => {
      s.accessToken = undefined;
      s.role = undefined;
      s.email = undefined;
    },
  },
});

export const { setAuth, clearAuth } = slice.actions;
export default slice.reducer;
