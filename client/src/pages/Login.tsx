/**
 * @author Bob's Garage Team
 * @purpose Login page with improved styling and animations
 * @version 2.0.0
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, Col, Form, Row, Alert, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../lib/validation";
import { useToast } from "../components/ui/ToastProvider";
import { MdLogin, MdEmail, MdLock, MdPersonAdd } from "react-icons/md";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const nav = useNavigate();
	const { login } = useAuth();
	const { notify } = useToast();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(undefined);
		setLoading(true);
		try {
			// client-side validation
			loginSchema.parse({ email, password });
			await login({ email, password });
			notify({
				title: "Welcome",
				body: "Logged in successfully",
				variant: "success",
			});
			nav("/");
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message || error?.message || "Login failed. Please check your credentials.";
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
										<MdLogin size={64} className="text-primary mb-3" />
									</motion.div>
									<h1 className="mb-2">Welcome Back</h1>
									<p className="text-muted">Sign in to your account to continue</p>
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

								{/* Login Form */}
								<Form onSubmit={onSubmit}>
									<Form.Group className="mb-3">
										<Form.Label htmlFor="login-email">Email</Form.Label>
										<InputGroup>
											<InputGroup.Text aria-hidden="true">
												<MdEmail />
											</InputGroup.Text>
											<Form.Control
												id="login-email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												type="email"
												placeholder="Enter your email"
												required
												autoComplete="email"
												autoFocus
											/>
										</InputGroup>
									</Form.Group>

									<Form.Group className="mb-3">
										<div className="d-flex justify-content-between align-items-center mb-2">
											<Form.Label htmlFor="login-password" className="mb-0">Password</Form.Label>
											<Link
												to="/forgot-password"
												className="text-decoration-none small"
												style={{ fontSize: "0.875rem" }}
											>
												Forgot password?
											</Link>
										</div>
										<InputGroup>
											<InputGroup.Text aria-hidden="true">
												<MdLock />
											</InputGroup.Text>
											<Form.Control
												id="login-password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												type="password"
												placeholder="Enter your password"
												required
												autoComplete="current-password"
											/>
										</InputGroup>
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
											{loading ? "Logging in..." : "Login"}
										</Button>
									</motion.div>
								</Form>

								{/* Register Link */}
								<div className="text-center mt-4 pt-3 border-top">
									<p className="text-muted mb-2">Don't have an account?</p>
									<Link to="/register" className="text-decoration-none">
										<Button variant="outline-secondary" className="d-inline-flex align-items-center gap-2">
											<MdPersonAdd />
											Create Account
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
