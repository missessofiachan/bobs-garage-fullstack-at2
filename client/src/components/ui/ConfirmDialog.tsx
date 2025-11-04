/**
 * @author Bob's Garage Team
 * @purpose Reusable confirmation dialog using Bootstrap Modal
 * @version 1.0.0
 */

import { Button, Modal } from "react-bootstrap";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "primary";
	onConfirm: () => void;
}

export default function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "primary",
	onConfirm,
}: ConfirmDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<Modal show={open} onHide={() => onOpenChange(false)} centered>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			{description && <Modal.Body>{description}</Modal.Body>}
			<Modal.Footer>
				<Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
					{cancelLabel}
				</Button>
				<Button variant={variant} size="sm" onClick={handleConfirm}>
					{confirmLabel}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
