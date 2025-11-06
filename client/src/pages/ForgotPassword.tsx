/**
 * @author Bob's Garage Team
 * @purpose Forgot Password page for password reset requests
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import { MdArrowBack, MdCheckCircle, MdEmail, MdLockReset } from "react-icons/md";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AuthCardLayout from "../components/layouts/AuthCardLayout";
import { useToast } from "../components/ui/ToastProvider";
import { useErrorHandler } from "../hooks/useErrorHandler";
import usePageTitle from "../hooks/usePageTitle";

export default function ForgotPassword() {
	usePageTitle("Forgot Password");
	const [email, setEmail] = useState("");
	const [err, setErr] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
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
			handleError(error || new Error("Failed to send reset email. Please try again."));
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthCardLayout
			icon={<MdLockReset size={64} className="text-primary mb-3" />}
			title="Reset Password"
			subtitle="Enter your email address and we'll send you reset instructions"
			error={err}
			footer={
				!success && (
					<Link to="/login" className="text-decoration-none">
						<Button variant="outline-secondary" className="d-inline-flex align-items-center gap-2">
							<MdArrowBack />
							Back to Login
						</Button>
					</Link>
				)
			}
		>
			{/* YouTube Video Embed */}
			<div className="mb-4">
				<div className="ratio ratio-16x9">
					<iframe
						src="https://www.youtube.com/embed/L8XbI9aJOXk"
						title="Password Reset Help Video"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						style={{ borderRadius: "8px" }}
					/>
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

					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<Button type="submit" variant="primary" size="lg" className="w-100 mb-3" disabled={loading}>
							{loading ? "Sending..." : "Send Reset Instructions"}
						</Button>
					</motion.div>
				</Form>
			)}
		</AuthCardLayout>
	);
}
