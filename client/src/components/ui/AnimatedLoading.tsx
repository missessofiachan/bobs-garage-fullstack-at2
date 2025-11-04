/**
 * @author Bob's Garage Team
 * @purpose Animated loading component using Framer Motion with Trans Pride colors
 * @version 2.0.0
 */

import { motion } from "framer-motion";
import "./TransPrideSpinner.css";

interface AnimatedLoadingProps {
	message?: string;
	variant?: "border" | "grow" | "trans-pride";
}

export default function AnimatedLoading({
	message,
	variant = "trans-pride",
}: AnimatedLoadingProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="d-flex flex-column align-items-center justify-content-center"
			style={{ minHeight: 160 }}
		>
			{variant === "trans-pride" ? (
				<div className="trans-pride-spinner" role="status" aria-hidden="true">
					<span className="visually-hidden">Loading...</span>
				</div>
			) : (
				<div
					className={`spinner-${variant === "border" ? "border" : "grow"}`}
					role="status"
					aria-hidden="true"
				>
					<span className="visually-hidden">Loading...</span>
				</div>
			)}
			{message && (
				<motion.div
					initial={{ y: -10, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="mt-3 text-muted"
					aria-live="polite"
					style={{ color: "#d1d5db" }}
				>
					{message}
				</motion.div>
			)}
		</motion.div>
	);
}
