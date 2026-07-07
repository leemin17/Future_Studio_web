import { defineConfig } from 'vitest/config'

// Cấu hình riêng cho Vitest.
// Không nạp các plugin của app (React/rolldown) vì các unit test hiện tại
// đều là TypeScript thuần (không dùng JSX), giúp test chạy nhanh và ổn định.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.ts', 'src/data/**/*.ts'],
      exclude: ['src/utils/index.ts'],
      reporter: ['text', 'html'],
    },
  },
})
