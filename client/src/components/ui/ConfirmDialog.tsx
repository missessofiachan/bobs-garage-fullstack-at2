/**
 * @author Bob's Garage Team
 * @purpose Reusable confirmation dialog using Radix UI
 * @version 1.0.0
 */

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "react-bootstrap";

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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<AnimatePresence>
				{open && (
					<Dialog.Portal forceMount>
						<Dialog.Overlay asChild forceMount>
							<motion.div
								className="position-fixed top-0 start-0 w-100 h-100"
								style={{
									backgroundColor: "rgba(0, 0, 0, 0.5)",
									zIndex: 1040,
								}}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							/>
						</Dialog.Overlay>
						<Dialog.Content asChild forceMount>
							<motion.div
								className="position-fixed top-50 start-50 translate-middle bg-body rounded shadow-lg p-4"
								style={{
									zIndex: 1050,
									minWidth: "300px",
									maxWidth: "90vw",
								}}
								initial={{ opacity: 0, scale: 0.9, y: -20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9, y: -20 }}
								transition={{ type: "spring", duration: 0.3 }}
							>
								<Dialog.Title className="h5 mb-2">{title}</Dialog.Title>
								{description && (
									<Dialog.Description className="text-muted mb-3">{description}</Dialog.Description>
								)}
								<div className="d-flex justify-content-end gap-2">
									<Dialog.Close asChild>
										<Button variant="secondary" size="sm">
											{cancelLabel}
										</Button>
									</Dialog.Close>
									<Button variant={variant} size="sm" onClick={handleConfirm}>
										{confirmLabel}
									</Button>
								</div>
							</motion.div>
						</Dialog.Content>
					</Dialog.Portal>
				)}
			</AnimatePresence>
		</Dialog.Root>
	);
}
