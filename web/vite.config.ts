import type { ServerResponse } from 'http';
import react from '@vitejs/plugin-react';
import { defineConfig, type ProxyOptions } from 'vitest/config';

const proxyApi: Record<string, ProxyOptions> = {
  '/api': {
    target: 'http://127.0.0.1:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
    configure(proxy) {
      proxy.on('error', (_err, _req, res) => {
        const respuesta = res as ServerResponse;
        if (respuesta && !respuesta.headersSent && typeof respuesta.writeHead === 'function') {
          respuesta.writeHead(502, { 'Content-Type': 'application/json' });
          respuesta.end(
            JSON.stringify({
              message: 'La API no responde. ¿Está encendida en el puerto 3000?',
            }),
          );
        }
      });
    },
  },
};

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, proxy: proxyApi },
  preview: { host: true, port: 4173, proxy: proxyApi },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      // Lógica de la interfaz. Quedan fuera el arranque y el guion de sustentación,
      // que no es una regla del producto.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/guia/**', 'src/**/*.test.{ts,tsx}', 'src/test/**'],
      thresholds: {
        lines: 58,
        statements: 58,
        branches: 66,
        functions: 56,
      },
    },
  },
});
