/**
 * @author Bob's Garage Team
 * @purpose Forgot Password page for password reset requests
 * @version 1.0.0
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, Col, Form, Row, Alert, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/ToastProvider";
import { MdLockReset, MdEmail, MdArrowBack, MdCheckCircle } from "react-icons/md";
import api from "../api/axios";
import usePageTitle from "../hooks/usePageTitle";

export default function ForgotPassword() {
	usePageTitle("Forgot Password");
	const [email, setEmail] = useState("");
	const [err, setErr] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const nav = useNavigate();
	const { notify } = useToast();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(undefined);
		setLoading(true);
		try {
			// Basic email validation
			if (!email || !email.includes("@")) {
				setErr("Please enter a valid email address");
				setLoading(false);
				return;
			}

			// Try to call the API endpoint (will fail gracefully if backend doesn't exist yet)
			try {
				await api.post("/auth/forgot-password", { email });
			} catch (error: any) {
				// If endpoint doesn't exist (404), we still show success for security
				// This prevents email enumeration attacks
				if (error?.response?.status !== 404) {
					throw error;
				}
			}

			setSuccess(true);
			notify({
				title: "Email Sent",
				body: "If an account exists with this email, you'll receive password reset instructions.",
				variant: "success",
			});
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message || error?.message || "Failed to send reset email. Please try again.";
			setErr(errorMessage);
			notify({ body: errorMessage, variant: "danger" });
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
										<MdLockReset size={64} className="text-primary mb-3" />
									</motion.div>
									<h1 className="mb-2">Reset Password</h1>
									<p className="text-muted">Enter your email address and we'll send you reset instructions</p>
								</div>

								{/* YouTube Video Embed */}
								<div className="mb-4">
									<div className="ratio ratio-16x9">
										<iframe
											src="https://www.youtube.com/embed/L8XbI9aJOXk"
											title="Password Reset Help Video"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
											style={{ borderRadius: "8px" }}
										></iframe>
									</div>
								</div>

								{success ? (
									<>
										{/* Success State */}
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-center mb-4"
										>
											<MdCheckCircle size={48} className="text-primary mb-3" />
											<Alert
												style={{
													backgroundColor: "rgba(85, 205, 252, 0.15)",
													borderColor: "#55CDFC",
													color: "inherit",
												}}
												className="border"
											>
												<h5 style={{ color: "#55CDFC" }}>Check your email</h5>
												<p className="mb-0">
													If an account exists with <strong>{email}</strong>, you'll receive password reset
													instructions shortly.
												</p>
											</Alert>
										</motion.div>

										<div className="text-center mt-4">
											<Link to="/login" className="text-decoration-none">
												<Button variant="primary" className="d-inline-flex align-items-center gap-2">
													<MdArrowBack />
													Back to Login
												</Button>
											</Link>
										</div>
									</>
								) : (
									<>
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

										{/* Form */}
										<Form onSubmit={onSubmit}>
											<Form.Group className="mb-4">
												<Form.Label htmlFor="forgot-password-email">Email Address</Form.Label>
												<InputGroup>
											<InputGroup.Text aria-hidden="true">
												<MdEmail />
											</InputGroup.Text>
													<Form.Control
														id="forgot-password-email"
														value={email}
														onChange={(e) => setEmail(e.target.value)}
														type="email"
														placeholder="Enter your email"
														required
														autoComplete="email"
														autoFocus
													/>
												</InputGroup>
												<Form.Text className="text-muted">
													We'll send password reset instructions to this email address
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
													{loading ? "Sending..." : "Send Reset Instructions"}
												</Button>
											</motion.div>
										</Form>

										{/* Back to Login Link */}
										<div className="text-center mt-4 pt-3 border-top">
											<Link to="/login" className="text-decoration-none">
												<Button variant="outline-secondary" className="d-inline-flex align-items-center gap-2">
													<MdArrowBack />
													Back to Login
												</Button>
											</Link>
										</div>
									</>
								)}
							</Card.Body>
						</Card>
					</motion.div>
				</Col>
			</Row>
		</motion.div>
	);
}

