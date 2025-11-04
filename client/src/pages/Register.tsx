/**
 * @author Bob's Garage Team
 * @purpose Register page with improved styling and animations
 * @version 2.0.0
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, Col, Form, Row, Alert, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { registerSchema } from "../lib/validation";
import { useToast } from "../components/ui/ToastProvider";
import { MdPersonAdd, MdEmail, MdLock, MdLogin } from "react-icons/md";
import { formatErrorMessage } from "../utils/errorFormatter";

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | undefined>();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const nav = useNavigate();
	const { register } = useAuth();
	const { notify } = useToast();

	const formatError = (error: any): string => {
		// Use the centralized error formatter
		return formatErrorMessage(error);
	};

	const extractFieldErrors = (error: any): Record<string, string> => {
		const errors: Record<string, string> = {};
		if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
			error.response.data.errors.forEach((issue: any) => {
				const field = issue.path?.[0] || "general";
				if (issue.message) {
					errors[field] = issue.message;
				}
			});
		}
		return errors;
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(undefined);
		setFieldErrors({});
		setLoading(true);
		try {
			registerSchema.parse({ email, password });
			await register({ email, password });
			notify({ title: "Success", body: "Account created successfully", variant: "success" });
			nav("/login");
		} catch (error: any) {
			// Handle client-side Zod validation errors
			if (error?.issues && Array.isArray(error.issues)) {
				const messages = error.issues
					.map((issue: any) => issue.message || `${issue.path?.join(".")}: Invalid value`)
					.filter(Boolean);
				setErr(messages.join(". "));
				// Also set field-specific errors
				const fieldErrs = extractFieldErrors({ response: { data: { errors: error.issues } } });
				setFieldErrors(fieldErrs);
				// Show simple toast for client-side validation
				notify({ body: "Please check the form for errors", variant: "danger" });
			} else {
				// Handle server errors
				const errorMessage = formatError(error);
				setErr(errorMessage);
				const fieldErrs = extractFieldErrors(error);
				setFieldErrors(fieldErrs);
				// Show formatted error in toast
				notify({ body: errorMessage, variant: "danger" });
			}
		} finally {
			setLoading(false);
		}
	};

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
										<MdPersonAdd size={64} className="text-primary mb-3" />
									</motion.div>
									<h1 className="mb-2">Create Account</h1>
									<p className="text-muted">Join Bob's Garage and start managing your services</p>
								</div>

								{/* Error Alert */}
								{err && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
									>
										<Alert variant="danger" className="mb-4">
											{err}
										</Alert>
									</motion.div>
								)}

								{/* Register Form */}
								<Form onSubmit={onSubmit}>
									<Form.Group className="mb-3">
										<Form.Label htmlFor="register-email">Email</Form.Label>
										<InputGroup>
											<InputGroup.Text aria-hidden="true">
												<MdEmail />
											</InputGroup.Text>
											<Form.Control
												id="register-email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												type="email"
												placeholder="Enter your email"
												required
												autoComplete="email"
												autoFocus
												isInvalid={!!fieldErrors.email}
												aria-invalid={!!fieldErrors.email}
												aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
											/>
										</InputGroup>
										{fieldErrors.email && (
											<Form.Control.Feedback type="invalid" className="d-block" id="register-email-error" role="alert">
												{fieldErrors.email}
											</Form.Control.Feedback>
										)}
									</Form.Group>

									<Form.Group className="mb-4">
										<Form.Label htmlFor="register-password">Password</Form.Label>
										<InputGroup>
											<InputGroup.Text aria-hidden="true">
												<MdLock />
											</InputGroup.Text>
											<Form.Control
												id="register-password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												type="password"
												placeholder="Enter your password"
												required
												autoComplete="new-password"
												isInvalid={!!fieldErrors.password}
												aria-invalid={!!fieldErrors.password}
												aria-describedby={
													fieldErrors.password
														? "register-password-error register-password-hint"
														: "register-password-hint"
												}
											/>
										</InputGroup>
										{fieldErrors.password && (
											<Form.Control.Feedback type="invalid" className="d-block" id="register-password-error" role="alert">
												{fieldErrors.password}
											</Form.Control.Feedback>
										)}
										<Form.Text className="text-muted" id="register-password-hint">
											Password must be at least 8 characters long
										</Form.Text>
									</Form.Group>

									<motion.div
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Button
											type="submit"
											variant="primary"
											size="lg"
											className="w-100 mb-3"
											disabled={loading}
										>
											{loading ? "Creating Account..." : "Create Account"}
										</Button>
									</motion.div>
								</Form>

								{/* Login Link */}
								<div className="text-center mt-4 pt-3 border-top">
									<p className="text-muted mb-2">Already have an account?</p>
									<Link to="/login" className="text-decoration-none">
										<Button variant="outline-secondary" className="d-inline-flex align-items-center gap-2">
											<MdLogin />
											Sign In
										</Button>
									</Link>
								</div>
							</Card.Body>
						</Card>
					</motion.div>
				</Col>
			</Row>
		</motion.div>
	);
}
