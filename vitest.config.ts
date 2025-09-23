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
      '@models': path.resolve(__dirname, './src/models'),
      '@parser': path.resolve(__dirname, './src/parser'),
      '@logger': path.resolve(__dirname, './src/utils/logger'),
      '@file-validation': path.resolve(
        __dirname,
        './src/utils/file-validation',
      ),
      '@id-generator': path.resolve(__dirname, './src/utils/id-generator'),
    },
  },
});
