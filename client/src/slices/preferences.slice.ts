import { createSlice } from '@reduxjs/toolkit';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type ServicesSort = 'price-asc' | 'price-desc';
export type ServicesView = 'grid' | 'list';

type PrefsState = {
  theme: ThemeChoice;
  servicesSort: ServicesSort;
  servicesView: ServicesView;
};

const initial: PrefsState = {
  theme: (localStorage.getItem('theme-default') as ThemeChoice) || 'light',
  servicesSort:
    (localStorage.getItem('services-sort') as ServicesSort) || 'price-asc',
  servicesView:
    (localStorage.getItem('services-view') as ServicesView) || 'grid',
};

const slice = createSlice({
  name: 'preferences',
  initialState: initial,
  reducers: {
    setThemeDefault: (s, a: { payload: ThemeChoice }) => {
      s.theme = a.payload;
    },
    setServicesSort: (s, a: { payload: ServicesSort }) => {
      s.servicesSort = a.payload;
    },
    setServicesView: (s, a: { payload: ServicesView }) => {
      s.servicesView = a.payload;
    },
  },
});

export const { setThemeDefault, setServicesSort, setServicesView } =
  slice.actions;
export default slice.reducer;
