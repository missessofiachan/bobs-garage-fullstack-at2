/**
 * @author Bob's Garage Team
 * @purpose Login page with improved styling and animations
 * @version 2.0.0
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import { MdEmail, MdLock, MdLogin, MdPersonAdd, MdSecurity } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import AuthCardLayout from "../components/layouts/AuthCardLayout";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../hooks/useAuth";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { loginSchema } from "../lib/validation";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [err, setErr] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const nav = useNavigate();
	const { login } = useAuth();
	const { notify } = useToast();
	const handleError = useErrorHandler({
		setError: setErr,
		showToast: true,
	});

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(undefined);
		setLoading(true);
		try {
			// client-side validation
			loginSchema.parse({ email, password });
			await login({ email, password, rememberMe });
			notify({
				title: "Welcome",
				body: "Logged in successfully",
				variant: "success",
			});
			nav("/");
		} catch (error: any) {
			handleError(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthCardLayout
			icon={<MdLogin size={64} className="text-primary mb-3" />}
			title="Welcome Back"
			subtitle="Sign in to your account to continue"
			error={err}
			footer={
				<>
					<p className="text-muted mb-2">Don't have an account?</p>
					<Link to="/register" className="text-decoration-none">
						<Button variant="outline-secondary" className="d-inline-flex align-items-center gap-2">
							<MdPersonAdd />
							Create Account
						</Button>
					</Link>
				</>
			}
		>
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
						<Form.Label htmlFor="login-password" className="mb-0">
							Password
						</Form.Label>
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

				{/* Remember Me Checkbox */}
				<Form.Group className="mb-3">
					<Form.Check
						type="checkbox"
						id="remember-me"
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
						label={
							<div className="d-flex align-items-start gap-2">
								<span>Keep me signed in</span>
							</div>
						}
					/>
					{rememberMe && (
						<Alert variant="warning" className="mt-2 mb-0 py-2" style={{ fontSize: "0.875rem" }}>
							<div className="d-flex align-items-start gap-2">
								<MdSecurity size={18} className="mt-1 flex-shrink-0" />
								<div>
									<strong>Security Note:</strong> This will keep you signed in for longer. Only use this on
									trusted devices.
								</div>
							</div>
						</Alert>
					)}
				</Form.Group>

				<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
					<Button type="submit" variant="primary" size="lg" className="w-100 mb-3" disabled={loading}>
						{loading ? "Logging in..." : "Login"}
					</Button>
				</motion.div>
			</Form>
		</AuthCardLayout>
	);
}
