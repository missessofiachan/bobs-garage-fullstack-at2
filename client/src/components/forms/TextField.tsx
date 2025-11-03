import { Form } from 'react-bootstrap';
import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
};

export default function TextField({ label, error, hint, ...rest }: Props) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      {/* cast to any to avoid strict prop incompat (react-bootstrap Form.Control expects specific size type) */}
      <Form.Control isInvalid={!!error} {...(rest as any)} />
      {hint && <Form.Text muted>{hint}</Form.Text>}
      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </Form.Group>
  );
}
