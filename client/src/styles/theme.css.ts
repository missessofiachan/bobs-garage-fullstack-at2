import { createTheme, createThemeContract, style } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    bg: null,
    text: null,
    muted: null,
    brand: null,
    border: null,
  },
  space: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
  },
  radius: {
    sm: null,
    md: null,
    lg: null,
  },
});

export const lightTheme = createTheme(vars, {
  color: {
    bg: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    brand: '#0d6efd',
    border: '#e5e7eb',
  },
  space: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
  radius: { sm: '4px', md: '8px', lg: '12px' },
});

export const darkTheme = createTheme(vars, {
  color: {
    bg: '#0b0f17',
    text: '#f3f4f6',
    muted: '#9ca3af',
    brand: '#66b2ff',
    border: '#1f2937',
  },
  space: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
  radius: { sm: '4px', md: '8px', lg: '12px' },
});

export const container = style({
  margin: '0 auto',
  padding: vars.space.md,
});
