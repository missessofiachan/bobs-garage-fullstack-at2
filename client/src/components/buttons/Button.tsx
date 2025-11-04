/**
 * @author Bob's Garage Team
 * @purpose Custom button component with theme-aware styling using Vanilla-Extract
 * @version 1.0.0
 */

import type { ButtonHTMLAttributes } from "react";
import { size, variant } from "./button.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	tone?: keyof typeof variant;
	sz?: keyof typeof size;
};

export default function DSButton({ tone = "primary", sz = "md", className, ...rest }: Props) {
	return (
		<button className={[variant[tone], size[sz], className].filter(Boolean).join(" ")} {...rest} />
	);
}
