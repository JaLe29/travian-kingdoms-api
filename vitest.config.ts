import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['test/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/**/*.ts'],
			exclude: ['src/index.ts', 'src/types.ts'],
			thresholds: {
				statements: 90,
				branches: 90,
				functions: 90,
				lines: 90,
			},
		},
	},
});
