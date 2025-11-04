import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { registerSchema } from "../lib/validation";
import { useToast } from "../components/ui/ToastProvider";

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | undefined>();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const nav = useNavigate();
	const { register } = useAuth();
	const { notify } = useToast();

	const formatError = (error: any): string => {
		// Handle Zod validation errors from server
		if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
			const messages = error.response.data.errors
				.map((issue: any) => issue.message || `${issue.path?.join(".")}: ${issue.message || "Invalid value"}`)
				.filter(Boolean);
			return messages.join(". ");
		}
		// Handle other error formats
		if (error?.response?.data?.message) {
			return error.response.data.message;
		}
		if (error?.message) {
			return error.message;
		}
		return "Registration failed";
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
		try {
			registerSchema.parse({ email, password });
			await register({ email, password });
			notify({ title: "Success", body: "Account created", variant: "success" });
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
			} else {
				// Handle server errors
				const errorMessage = formatError(error);
				setErr(errorMessage);
				const fieldErrs = extractFieldErrors(error);
				setFieldErrors(fieldErrs);
			}
			notify({ body: formatError(error), variant: "danger" });
		}
	};

	return (
		<div>
			<h1>Register</h1>
			<Form onSubmit={onSubmit} style={{ maxWidth: 360 }}>
				<Form.Group className="mb-2">
					<Form.Label>Email</Form.Label>
					<Form.Control
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						required
						isInvalid={!!fieldErrors.email}
					/>
					{fieldErrors.email && (
						<Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
					)}
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Password</Form.Label>
					<Form.Control
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						required
						isInvalid={!!fieldErrors.password}
					/>
					{fieldErrors.password && (
						<Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
					)}
					<Form.Text className="text-muted">Password must be at least 8 characters</Form.Text>
				</Form.Group>
				{err && <div className="text-danger mb-2">{err}</div>}
				<Button type="submit">Register</Button>
			</Form>
		</div>
	);
}
