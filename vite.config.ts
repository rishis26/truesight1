import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external network access
    port: 5173,
    strictPort: false,
    cors: true, // Enable CORS
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  base: './', // Use relative paths for production
  optimizeDeps: {
    exclude: ['lucide-react', 'openai', 'pdf-parse', 'mammoth'],
  },
  // Avoid exposing entire process.env. Use import.meta.env in code instead.
});
