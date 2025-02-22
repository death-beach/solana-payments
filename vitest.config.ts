import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
      ],
      outputFile: {
        json: './coverage/coverage.json',
        html: './coverage/html'
      },
      reportsDirectory: './coverage'
    },
    outputFile: './coverage/test-results.json'
  },
});