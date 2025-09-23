import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@logger': path.resolve(__dirname, './src/utils/logger'),
      '@file-validation': path.resolve(
        __dirname,
        './src/utils/file-validation',
      ),
    },
  },
});
