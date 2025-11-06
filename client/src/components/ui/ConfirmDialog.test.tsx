/**
 * @author Bob's Garage Team
 * @purpose Component tests for ConfirmDialog component
 * @version 1.0.0
 */

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./ConfirmDialog";

// Mock framer-motion to avoid animation delays
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		motion: {
			div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
		},
		AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	};
});

describe("ConfirmDialog", () => {
	const defaultProps = {
		open: true,
		onOpenChange: vi.fn(),
		title: "Confirm Action",
		onConfirm: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render when open is true", () => {
		render(<ConfirmDialog {...defaultProps} />);

		expect(screen.getByText("Confirm Action")).toBeInTheDocument();
	});

	it("should not render when open is false", () => {
		render(<ConfirmDialog {...defaultProps} open={false} />);

		expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
	});

	it("should render title", () => {
		render(<ConfirmDialog {...defaultProps} title="Delete Item" />);

		expect(screen.getByText("Delete Item")).toBeInTheDocument();
	});

	it("should render description when provided", () => {
		render(<ConfirmDialog {...defaultProps} description="This action cannot be undone." />);

		expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
	});

	it("should not render description when not provided", () => {
		render(<ConfirmDialog {...defaultProps} />);

		expect(screen.queryByText(/cannot be undone/i)).not.toBeInTheDocument();
	});

	it("should use default button labels", () => {
		render(<ConfirmDialog {...defaultProps} />);

		expect(screen.getByText("Confirm")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	it("should use custom button labels", () => {
		render(<ConfirmDialog {...defaultProps} confirmLabel="Delete" cancelLabel="Keep" />);

		expect(screen.getByText("Delete")).toBeInTheDocument();
		expect(screen.getByText("Keep")).toBeInTheDocument();
	});

	it("should use primary variant by default", () => {
		render(<ConfirmDialog {...defaultProps} />);

		const confirmButton = screen.getByText("Confirm").closest("button");
		expect(confirmButton).toHaveClass("btn-primary");
	});

	it("should use danger variant when specified", () => {
		render(<ConfirmDialog {...defaultProps} variant="danger" />);

		const confirmButton = screen.getByText("Confirm").closest("button");
		expect(confirmButton).toHaveClass("btn-danger");
	});

	it("should call onConfirm when confirm button is clicked", async () => {
		const onConfirm = vi.fn();
		const user = userEvent.setup();

		render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

		const confirmButton = screen.getByText("Confirm");
		await user.click(confirmButton);

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("should call onOpenChange(false) when confirm button is clicked", async () => {
		const onOpenChange = vi.fn();
		const user = userEvent.setup();

		render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

		const confirmButton = screen.getByText("Confirm");
		await user.click(confirmButton);

		await waitFor(() => {
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});
	});

	it("should call onOpenChange(false) when cancel button is clicked", async () => {
		const onOpenChange = vi.fn();
		const user = userEvent.setup();

		render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

		const cancelButton = screen.getByText("Cancel");
		await user.click(cancelButton);

		await waitFor(() => {
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});
	});

	it("should not call onConfirm when cancel button is clicked", async () => {
		const onConfirm = vi.fn();
		const user = userEvent.setup();

		render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

		const cancelButton = screen.getByText("Cancel");
		await user.click(cancelButton);

		expect(onConfirm).not.toHaveBeenCalled();
	});
});
