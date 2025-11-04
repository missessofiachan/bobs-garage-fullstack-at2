import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css.ts";

const base = style({
	cursor: "pointer",
	borderRadius: vars.radius.md,
	padding: `${vars.space.sm} ${vars.space.md}`,
	fontWeight: 600,
	border: `1px solid ${vars.color.border}`,
	transition: "background .15s ease, color .15s ease, border-color .15s ease, opacity .15s ease",
	selectors: {
		"&:disabled": { opacity: 0.6, cursor: "not-allowed" },
	},
});

export const variant = styleVariants({
	primary: [
		base,
		{
			background: vars.color.brand,
			color: "#fff",
			borderColor: vars.color.brand,
			selectors: {
				"&:hover:not(:disabled)": { filter: "brightness(0.95)" },
			},
		},
	],
	outline: [
		base,
		{
			background: "transparent",
			color: vars.color.text,
			selectors: {
				"&:hover:not(:disabled)": {
					background: "rgba(255,255,255,0.1)",
					filter: "brightness(1.1)",
				},
			},
		},
	],
	subtle: [
		base,
		{
			background: "transparent",
			color: vars.color.muted,
			borderColor: "transparent",
			selectors: {
				"&:hover:not(:disabled)": { color: vars.color.text },
			},
		},
	],
});

export const size = styleVariants({
	sm: { padding: `${vars.space.xs} ${vars.space.sm}`, fontSize: 13 },
	md: { padding: `${vars.space.sm} ${vars.space.md}`, fontSize: 14 },
	lg: { padding: `${vars.space.md} ${vars.space.lg}`, fontSize: 16 },
});
