/**
 * Vitest configuration for server tests
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@config': path.resolve(__dirname, 'src/config'),
      '@db': path.resolve(__dirname, 'src/db'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@middleware': path.resolve(__dirname, 'src/middleware'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});

