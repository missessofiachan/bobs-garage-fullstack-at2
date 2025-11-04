/**
 * @author Bob's Garage Team
 * @purpose CSS styles for applying user preferences (font size, density, accessibility)
 * @version 1.0.0
 */

import { globalStyle, style } from "@vanilla-extract/css";

// Font size classes
export const fontSizeSmall = style({
	vars: {
		"--pref-font-size": "0.875rem", // 14px
		"--pref-font-size-sm": "0.75rem", // 12px
		"--pref-font-size-lg": "1rem", // 16px
		"--pref-font-size-xl": "1.125rem", // 18px
	},
	fontSize: "var(--pref-font-size)",
});

export const fontSizeMedium = style({
	vars: {
		"--pref-font-size": "1rem", // 16px
		"--pref-font-size-sm": "0.875rem", // 14px
		"--pref-font-size-lg": "1.125rem", // 18px
		"--pref-font-size-xl": "1.25rem", // 20px
	},
	fontSize: "var(--pref-font-size)",
});

export const fontSizeLarge = style({
	vars: {
		"--pref-font-size": "1.125rem", // 18px
		"--pref-font-size-sm": "1rem", // 16px
		"--pref-font-size-lg": "1.25rem", // 20px
		"--pref-font-size-xl": "1.5rem", // 24px
	},
	fontSize: "var(--pref-font-size)",
});

// Density classes
export const densityComfortable = style({
	vars: {
		"--pref-spacing-xs": "4px",
		"--pref-spacing-sm": "8px",
		"--pref-spacing-md": "16px",
		"--pref-spacing-lg": "24px",
		"--pref-spacing-xl": "32px",
		"--pref-padding-xs": "4px 8px",
		"--pref-padding-sm": "8px 12px",
		"--pref-padding-md": "12px 16px",
		"--pref-padding-lg": "16px 24px",
		"--pref-gap-xs": "8px",
		"--pref-gap-sm": "12px",
		"--pref-gap-md": "16px",
		"--pref-gap-lg": "24px",
	},
});

export const densityCompact = style({
	vars: {
		"--pref-spacing-xs": "2px",
		"--pref-spacing-sm": "4px",
		"--pref-spacing-md": "8px",
		"--pref-spacing-lg": "12px",
		"--pref-spacing-xl": "16px",
		"--pref-padding-xs": "2px 4px",
		"--pref-padding-sm": "4px 8px",
		"--pref-padding-md": "6px 12px",
		"--pref-padding-lg": "8px 16px",
		"--pref-gap-xs": "4px",
		"--pref-gap-sm": "8px",
		"--pref-gap-md": "12px",
		"--pref-gap-lg": "16px",
	},
});

// High contrast mode
export const highContrast = style({});

// Reduced motion
export const reducedMotion = style({
	vars: {
		"--transition-duration": "0s",
		"--animation-duration": "0s",
	},
});

// Apply reduced motion globally when class is present
globalStyle(`${reducedMotion} *, ${reducedMotion} *::before, ${reducedMotion} *::after`, {
	"@media": {
		"(prefers-reduced-motion: reduce)": {
			animationDuration: "0.01ms !important",
			animationIterationCount: "1 !important",
			transitionDuration: "0.01ms !important",
			scrollBehavior: "auto",
		},
	},
	animationDuration: "var(--animation-duration, 0.01ms) !important",
	transitionDuration: "var(--transition-duration, 0.01ms) !important",
	animationDelay: "0s !important",
	transitionDelay: "0s !important",
});

// High contrast overrides - works with both light and dark themes
globalStyle(`html.${highContrast}`, {
	filter: "contrast(1.5) brightness(1.1)",
});

globalStyle(`html.${highContrast} body`, {
	filter: "none",
});

globalStyle(`html.${highContrast} button, html.${highContrast} .btn`, {
	borderWidth: "2px",
	borderStyle: "solid",
	fontWeight: "600",
});

globalStyle(`html.${highContrast} a`, {
	textDecoration: "underline",
	fontWeight: "600",
});

globalStyle(`html.${highContrast} input, html.${highContrast} select, html.${highContrast} textarea`, {
	borderWidth: "2px",
	borderStyle: "solid",
});
