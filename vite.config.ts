import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.VITE_BASE_PATH ?? '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'oyen-icon.svg', 'oyen-icon-maskable.svg'],
      manifest: {
        name: 'Math With Oyen',
        short_name: 'Math With Oyen',
        description: 'Fun math practice with Oyen the cat — for primary school kids (K-5)',
        theme_color: '#6366f1',
        background_color: '#f4f6fb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        icons: [
          {
            src: `${base}oyen-icon.svg`.replace('//', '/'),
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: `${base}oyen-icon.svg`.replace('//', '/'),
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: `${base}oyen-icon-maskable.svg`.replace('//', '/'),
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
});
