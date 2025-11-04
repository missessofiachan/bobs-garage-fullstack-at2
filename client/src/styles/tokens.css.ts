/**
 * @author Bob's Garage Team
 * @purpose Design tokens for Sprinkles utilities
 * @version 1.0.0
 */

export const tokens = {
	space: {
		"0": "0",
		"1": "4px",
		"2": "8px",
		"3": "12px",
		"4": "16px",
		"5": "20px",
		"6": "24px",
		"8": "32px",
		"10": "40px",
		"12": "48px",
		"16": "64px",
		"20": "80px",
		"24": "96px",
	},
	colors: {
		// Light theme colors
		white: "#ffffff",
		"gray-50": "#f9fafb",
		"gray-100": "#f3f4f6",
		"gray-200": "#e5e7eb",
		"gray-300": "#d1d5db",
		"gray-400": "#9ca3af",
		"gray-500": "#6b7280",
		"gray-600": "#4b5563",
		"gray-700": "#374151",
		"gray-800": "#1f2937",
		"gray-900": "#111827",

		// Brand colors
		"blue-50": "#eff6ff",
		"blue-100": "#dbeafe",
		"blue-200": "#bfdbfe",
		"blue-300": "#93c5fd",
		"blue-400": "#60a5fa",
		"blue-500": "#3b82f6",
		"blue-600": "#2563eb",
		"blue-700": "#1d4ed8",
		"blue-800": "#1e40af",
		"blue-900": "#1e3a8a",

		// Semantic colors
		success: "#10b981",
		error: "#ef4444",
		warning: "#F7A8B8", // Trans pride pink
		info: "#3b82f6",
	},
	radius: {
		none: "0",
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		full: "9999px",
	},
	fontSizes: {
		xs: "0.75rem",
		sm: "0.875rem",
		base: "1rem",
		lg: "1.125rem",
		xl: "1.25rem",
		"2xl": "1.5rem",
		"3xl": "1.875rem",
		"4xl": "2.25rem",
		"5xl": "3rem",
	},
	fontWeights: {
		normal: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
	},
	shadows: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
		xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
	},
	breakpoints: {
		sm: "640px",
		md: "768px",
		lg: "1024px",
		xl: "1280px",
		"2xl": "1536px",
	},
} as const;

export type TokenKey<T extends keyof typeof tokens> = keyof (typeof tokens)[T];
