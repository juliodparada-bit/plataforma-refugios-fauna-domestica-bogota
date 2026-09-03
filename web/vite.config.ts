import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

const proxyApi: Record<string, ProxyOptions> = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, proxy: proxyApi },
  preview: { host: true, port: 4173, proxy: proxyApi },
});
