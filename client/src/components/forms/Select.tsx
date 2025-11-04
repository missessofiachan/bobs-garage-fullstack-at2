import { Form } from "react-bootstrap";
import type { SelectHTMLAttributes, ReactNode } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
	label: ReactNode;
	error?: string;
	hint?: ReactNode;
};

export default function Select({ label, error, hint, ...rest }: Props) {
	return (
		<Form.Group className="mb-3">
			<Form.Label>{label}</Form.Label>
			<Form.Select isInvalid={!!error} {...(rest as any)} />
			{hint && <Form.Text muted>{hint}</Form.Text>}
			{error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
		</Form.Group>
	);
}
