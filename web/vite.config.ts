import type { ServerResponse } from 'http';
import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

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
});
