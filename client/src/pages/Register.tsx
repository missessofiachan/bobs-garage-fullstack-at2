/**
 * @author Bob's Garage Team
 * @purpose Register page with improved styling and animations
 * @version 2.0.0
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { MdEmail, MdLock, MdLogin, MdPersonAdd } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import AuthCardLayout from "../components/layouts/AuthCardLayout";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../hooks/useAuth";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { registerSchema } from "../lib/validation";
import { extractFieldErrors } from "../utils/errorFormatter";

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | undefined>();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const nav = useNavigate();
	const { register } = useAuth();
	const { notify } = useToast();
	const handleError = useErrorHandler({
		setError: setErr,
		setFieldErrors,
		showToast: true,
	});

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
		} catch (error: unknown) {
			// Handle client-side Zod validation errors
			if (error && typeof error === "object" && "issues" in error && Array.isArray(error.issues)) {
				const fieldErrs = extractFieldErrors(error);
				setFieldErrors(fieldErrs);
				// Show simple toast for client-side validation
				notify({ body: "Please check the form for errors", variant: "danger" });
			} else {
				// Handle server errors
				handleError(error);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthCardLayout
			icon={<MdPersonAdd size={64} className="text-primary mb-3" />}
			title="Create Account"
			subtitle="Join Bob's Garage and start managing your services"
			error={err}
			footer={
				<>
					<p className="text-muted mb-2">Already have an account?</p>
					<Link to="/login" className="text-decoration-none">
						<Button variant="outline-secondary" className="d-inline-flex align-items-center gap-2">
							<MdLogin />
							Sign In
						</Button>
					</Link>
				</>
			}
		>
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
						<Form.Control.Feedback
							type="invalid"
							className="d-block"
							id="register-email-error"
							role="alert"
						>
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
						<Form.Control.Feedback
							type="invalid"
							className="d-block"
							id="register-password-error"
							role="alert"
						>
							{fieldErrors.password}
						</Form.Control.Feedback>
					)}
					<Form.Text className="text-muted" id="register-password-hint">
						Password must be at least 8 characters long
					</Form.Text>
				</Form.Group>

				<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
		</AuthCardLayout>
	);
}
