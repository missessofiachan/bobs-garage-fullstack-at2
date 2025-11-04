/**
 * @author Bob's Garage Team
 * @purpose Custom button component with theme-aware styling using Vanilla-Extract
 * @version 1.0.0
 */

import { variant, size } from "./button.css";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	tone?: keyof typeof variant;
	sz?: keyof typeof size;
};

export default function DSButton({ tone = "primary", sz = "md", className, ...rest }: Props) {
	return (
		<button className={[variant[tone], size[sz], className].filter(Boolean).join(" ")} {...rest} />
	);
}
