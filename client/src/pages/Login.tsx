import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../lib/validation";
import { useToast } from "../components/ui/ToastProvider";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | undefined>();
	const nav = useNavigate();
	const { login } = useAuth();
	const { notify } = useToast();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(undefined);
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
		} catch {
			setErr("Login failed");
			notify({ body: "Login failed", variant: "danger" });
		}
	};

	return (
		<div>
			<h1>Login</h1>
			<Form onSubmit={onSubmit} style={{ maxWidth: 360 }}>
				<Form.Group className="mb-2">
					<Form.Label>Email</Form.Label>
					<Form.Control
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Password</Form.Label>
					<Form.Control
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						required
					/>
				</Form.Group>
				{err && <div className="text-danger mb-2">{err}</div>}
				<Button type="submit">Login</Button>
			</Form>
		</div>
	);
}
