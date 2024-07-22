import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig as defineViteConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';

const appConfig = defineViteConfig({
  server: {
    port: 3000,
  },
  plugins: [react(), TanStackRouterVite()],
});

const testConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './test-setup.ts',
    include: ['tests/**/*.ts', 'tests/**/*.tsx'],
  },
});

export default mergeConfig(appConfig, testConfig);
