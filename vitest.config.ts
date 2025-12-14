import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [vue(), tailwindcss()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
	},
});

