import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/hooks/useAuth';
import { registerSchema } from '../lib/validation';

export default function Register() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [err, setErr] = useState<string|undefined>();
	const nav = useNavigate();
	const { register } = useAuth();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(undefined);
		try {
			registerSchema.parse({ email, password });
			await register({ email, password });
			nav('/login');
		} catch {
			setErr('Registration failed');
		}
	};

	return (
		<div>
			<h1>Register</h1>
			<Form onSubmit={onSubmit} style={{ maxWidth: 360 }}>
				<Form.Group className="mb-2">
					<Form.Label>Email</Form.Label>
					<Form.Control value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Password</Form.Label>
					<Form.Control value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
				</Form.Group>
				{err && <div className="text-danger mb-2">{err}</div>}
				<Button type="submit">Register</Button>
			</Form>
		</div>
	);
}
