import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `vite build --mode profiling` swaps in React's profiling build so the
// React DevTools Profiler works against a production bundle.
export default defineConfig(({ mode }) => ({
  root: 'client',
  plugins: [react()],
  resolve: {
    alias: mode === 'profiling'
      ? { 'react-dom/client': 'react-dom/profiling', 'scheduler/tracing': 'scheduler/tracing-profiling' }
      : {},
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: mode === 'profiling' ? false : 'esbuild',
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000', '/art': 'http://localhost:4000' },
  },
}));
