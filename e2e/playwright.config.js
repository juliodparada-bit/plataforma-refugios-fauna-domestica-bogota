import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.FRONT_PORT ?? 5199);
const databaseUrl = process.env.DATABASE_URL ?? '';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 1 : 0,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npx nest start',
      cwd: '../api',
      url: 'http://127.0.0.1:3000/localidades',
      timeout: 180000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        JWT_SECRETO: process.env.JWT_SECRETO ?? 'secreto-de-prueba',
        PUERTO: '3000',
        WEB_ORIGEN: `http://127.0.0.1:${port}`,
      },
    },
    {
      command: `node node_modules/vite/bin/vite.js --port ${port} --strictPort --host 127.0.0.1`,
      cwd: '../web',
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
