/**
 * @file ErrorDisplay.tsx
 * @author Bob's Garage Team
 * @description Enhanced error display component with request ID support
 * @version 1.0.0
 * @since 1.0.0
 */

import { useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { formatErrorMessageWithId } from "../../utils/errorFormatter";

interface ErrorDisplayProps {
	error: unknown;
	title?: string;
	onDismiss?: () => void;
}

export default function ErrorDisplay({ error, title = "Error", onDismiss }: ErrorDisplayProps) {
	const [copied, setCopied] = useState(false);
	const { message, requestId, errorCode } = formatErrorMessageWithId(error);

	const copyRequestId = async () => {
		if (requestId) {
			await navigator.clipboard.writeText(requestId);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<Alert variant="danger" dismissible={!!onDismiss} onClose={onDismiss}>
			<Alert.Heading>{title}</Alert.Heading>
			<p className="mb-2">{message}</p>
			{requestId && (
				<div className="d-flex align-items-center gap-2 mt-2">
					<small className="text-muted">
						Request ID: <code>{requestId}</code>
					</small>
					<Button variant="outline-danger" size="sm" onClick={copyRequestId} className="ms-2">
						{copied ? "✓ Copied" : "Copy ID"}
					</Button>
				</div>
			)}
			{errorCode && (
				<small className="text-muted d-block mt-1">
					Error Code: <code>{errorCode}</code>
				</small>
			)}
		</Alert>
	);
}
