import { createTheme, createThemeContract, style, globalStyle } from "@vanilla-extract/css";

export const vars = createThemeContract({
	color: {
		bg: null,
		text: null,
		muted: null,
		brand: null,
		border: null,
		accent: null,
	},
	space: {
		xs: null,
		sm: null,
		md: null,
		lg: null,
	},
	radius: {
		sm: null,
		md: null,
		lg: null,
	},
});

export const lightTheme = createTheme(vars, {
	color: {
		bg: "#ffffff",
		text: "#111827",
		muted: "#6b7280",
		brand: "#55CDFC", // Trans pride flag blue
		accent: "#F7A8B8", // Trans pride flag pink
		border: "#e5e7eb",
	},
	space: { xs: "4px", sm: "8px", md: "16px", lg: "24px" },
	radius: { sm: "4px", md: "8px", lg: "12px" },
});

export const darkTheme = createTheme(vars, {
	color: {
		bg: "#121212", // true dark background
		text: "#f3f4f6", // improved contrast (was #e5e7eb) - 12.6:1 on #121212
		muted: "#d1d5db", // improved contrast (was #9ca3af) - 7.1:1 on #121212
		brand: "#7dd3fc", // Trans pride flag blue - lighter for better contrast on dark
		accent: "#F7A8B8", // Trans pride flag pink
		border: "#374151", // improved visibility (was #1f2937)
	},
	space: { xs: "4px", sm: "8px", md: "16px", lg: "24px" },
	radius: { sm: "4px", md: "8px", lg: "12px" },
});

// Apply dark theme to body and html when dark theme class is active
globalStyle(`html.${darkTheme}`, {
	backgroundColor: vars.color.bg,
	color: vars.color.text,
});

globalStyle(`html.${darkTheme} body`, {
	backgroundColor: vars.color.bg,
	color: vars.color.text,
	minHeight: "100vh",
	fontSize: "var(--pref-font-size, 1rem)",
});

// Apply light theme to body and html when light theme class is active
globalStyle(`html.${lightTheme}`, {
	backgroundColor: vars.color.bg,
	color: vars.color.text,
});

globalStyle(`html.${lightTheme} body`, {
	backgroundColor: vars.color.bg,
	color: vars.color.text,
	minHeight: "100vh",
	fontSize: "var(--pref-font-size, 1rem)",
});

// Ensure font sizes are applied globally when preference classes are active
globalStyle("html body", {
	fontSize: "var(--pref-font-size, 1rem)",
	lineHeight: "1.5",
});

globalStyle("html h1", {
	fontSize: "var(--pref-font-size-xl, 2rem)",
});

globalStyle("html h2", {
	fontSize: "var(--pref-font-size-lg, 1.5rem)",
});

globalStyle("html h3", {
	fontSize: "var(--pref-font-size-lg, 1.25rem)",
});

globalStyle("html small, html .small", {
	fontSize: "var(--pref-font-size-sm, 0.875rem)",
});

export const container = style({
	margin: "0 auto",
	padding: vars.space.md,
});
