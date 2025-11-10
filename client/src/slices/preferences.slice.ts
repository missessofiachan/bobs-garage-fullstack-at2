import { createSlice } from '@reduxjs/toolkit';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type ServicesSort = 'price-asc' | 'price-desc';
export type ServicesView = 'grid' | 'list';
export type FontSize = 'small' | 'medium' | 'large';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type Language = 'en' | 'es' | 'fr';
export type Density = 'comfortable' | 'compact';

type PrefsState = {
  theme: ThemeChoice;
  servicesSort: ServicesSort;
  servicesView: ServicesView;
  fontSize: FontSize;
  dateFormat: DateFormat;
  language: Language;
  density: Density;
  animationsEnabled: boolean;
  notificationsEmail: boolean;
  notificationsMarketing: boolean;
  accessibilityHighContrast: boolean;
  accessibilityReducedMotion: boolean;
};

const initial: PrefsState = {
  theme: (localStorage.getItem('theme-default') as ThemeChoice) || 'light',
  servicesSort: (localStorage.getItem('services-sort') as ServicesSort) || 'price-asc',
  servicesView: (localStorage.getItem('services-view') as ServicesView) || 'grid',
  fontSize: (localStorage.getItem('font-size') as FontSize) || 'medium',
  dateFormat: (localStorage.getItem('date-format') as DateFormat) || 'MM/DD/YYYY',
  language: (localStorage.getItem('language') as Language) || 'en',
  density: (localStorage.getItem('density') as Density) || 'comfortable',
  animationsEnabled: localStorage.getItem('animations-enabled') !== 'false',
  notificationsEmail: localStorage.getItem('notifications-email') !== 'false',
  notificationsMarketing: localStorage.getItem('notifications-marketing') === 'true',
  accessibilityHighContrast: localStorage.getItem('accessibility-high-contrast') === 'true',
  accessibilityReducedMotion: localStorage.getItem('accessibility-reduced-motion') === 'true',
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
    setFontSize: (s, a: { payload: FontSize }) => {
      s.fontSize = a.payload;
    },
    setDateFormat: (s, a: { payload: DateFormat }) => {
      s.dateFormat = a.payload;
    },
    setLanguage: (s, a: { payload: Language }) => {
      s.language = a.payload;
    },
    setDensity: (s, a: { payload: Density }) => {
      s.density = a.payload;
    },
    setAnimationsEnabled: (s, a: { payload: boolean }) => {
      s.animationsEnabled = a.payload;
    },
    setNotificationsEmail: (s, a: { payload: boolean }) => {
      s.notificationsEmail = a.payload;
    },
    setNotificationsMarketing: (s, a: { payload: boolean }) => {
      s.notificationsMarketing = a.payload;
    },
    setAccessibilityHighContrast: (s, a: { payload: boolean }) => {
      s.accessibilityHighContrast = a.payload;
    },
    setAccessibilityReducedMotion: (s, a: { payload: boolean }) => {
      s.accessibilityReducedMotion = a.payload;
    },
    resetPreferences: () => initial,
  },
});

export const {
  setThemeDefault,
  setServicesSort,
  setServicesView,
  setFontSize,
  setDateFormat,
  setLanguage,
  setDensity,
  setAnimationsEnabled,
  setNotificationsEmail,
  setNotificationsMarketing,
  setAccessibilityHighContrast,
  setAccessibilityReducedMotion,
  resetPreferences,
} = slice.actions;
export default slice.reducer;
