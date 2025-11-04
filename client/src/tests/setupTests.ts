/**
 * Vitest setup for client tests
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => true,
	}),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	observe() {}
	unobserve() {}
	disconnect() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor() {}
	observe() {}
	unobserve() {}
	disconnect() {}
} as any;
