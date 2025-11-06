/**
 * @author Bob's Garage Team
 * @purpose Reusable card layout for authentication pages (Login, Register, ForgotPassword)
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Alert, Card, Col, Row } from "react-bootstrap";

interface AuthCardLayoutProps {
	/**
	 * Icon to display in the header
	 */
	icon: ReactNode;
	/**
	 * Main title
	 */
	title: string;
	/**
	 * Subtitle/description
	 */
	subtitle: string;
	/**
	 * Optional error message to display
	 */
	error?: string;
	/**
	 * Main content (form, etc.)
	 */
	children: ReactNode;
	/**
	 * Optional footer content (links, etc.)
	 */
	footer?: ReactNode;
}

/**
 * Reusable card layout component for authentication pages
 * Provides consistent styling and animations
 */
export default function AuthCardLayout({
	icon,
	title,
	subtitle,
	error,
	children,
	footer,
}: AuthCardLayoutProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="py-5"
		>
			<Row className="justify-content-center">
				<Col xs={12} sm={10} md={8} lg={6} xl={5}>
					<motion.div
						initial={{ scale: 0.95 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, duration: 0.4 }}
					>
						<Card className="shadow-sm">
							<Card.Body className="p-4 p-md-5">
								{/* Header */}
								<div className="text-center mb-4">
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
									>
										{icon}
									</motion.div>
									<h1 className="mb-2">{title}</h1>
									<p className="text-muted">{subtitle}</p>
								</div>

								{/* Error Alert */}
								{error && (
									<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
										<Alert variant="danger" className="mb-4">
											{error}
										</Alert>
									</motion.div>
								)}

								{/* Main Content */}
								{children}

								{/* Footer */}
								{footer && <div className="text-center mt-4 pt-3 border-top">{footer}</div>}
							</Card.Body>
						</Card>
					</motion.div>
				</Col>
			</Row>
		</motion.div>
	);
}
