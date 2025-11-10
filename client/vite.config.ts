import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

// Proxy plugin for preview mode
function previewProxyPlugin(): Plugin {
  return {
    name: 'preview-proxy',
    configurePreviewServer(server) {
      server.middlewares.use(
        '/api',
        createProxyMiddleware({
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        })
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin(), previewProxyPlugin()],
  server: {
    // Proxy for dev mode (npm run dev)
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
