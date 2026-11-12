import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.FRONT_PORT ?? 5199);

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 1 : 0,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node node_modules/vite/bin/vite.js --port ${port} --strictPort --host 127.0.0.1`,
    cwd: '../web',
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
