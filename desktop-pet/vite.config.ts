import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Tauri expects a fixed port in dev mode
  server: {
    port: 1420,
    strictPort: true,
  },
  // Prevent vite from obscuring Rust errors
  clearScreen: false,
  // Tauri uses environment variables
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri uses Chromium on Windows
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
