/**
 * Vitest configuration for client tests
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import path from "path";

export default defineConfig({
	plugins: [react(), vanillaExtractPlugin()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/tests/setupTests.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", "dist"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"src/tests/",
				"**/*.test.{ts,tsx}",
				"**/*.spec.{ts,tsx}",
				"**/*.config.{ts,js}",
				"**/main.tsx",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@components": path.resolve(__dirname, "src/components"),
			"@hooks": path.resolve(__dirname, "src/hooks"),
			"@utils": path.resolve(__dirname, "src/utils"),
			"@styles": path.resolve(__dirname, "src/styles"),
		},
	},
});
