/**
 * @author Bob's Garage Team
 * @purpose Component tests for ToastProvider
 * @version 1.0.0
 */

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ToastProvider, { useToast } from "./ToastProvider";

// Test component that uses useToast
function TestComponent() {
	const { notify } = useToast();
	return (
		<button onClick={() => notify({ body: "Test message", variant: "success" })}>Show Toast</button>
	);
}

describe("ToastProvider", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render children", () => {
		render(
			<ToastProvider>
				<div>Test Content</div>
			</ToastProvider>,
		);

		expect(screen.getByText("Test Content")).toBeInTheDocument();
	});

	it("should provide toast context to children", () => {
		render(
			<ToastProvider>
				<TestComponent />
			</ToastProvider>,
		);

		expect(screen.getByText("Show Toast")).toBeInTheDocument();
	});

	it("should throw error when useToast is called outside provider", () => {
		// Suppress console.error for this test
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			render(<TestComponent />);
		}).toThrow("ToastProvider missing");

		consoleSpy.mockRestore();
	});

	it("should display toast when notify is called", async () => {
		const user = userEvent.setup();

		render(
			<ToastProvider>
				<TestComponent />
			</ToastProvider>,
		);

		const button = screen.getByText("Show Toast");
		await user.click(button);

		await waitFor(() => {
			expect(screen.getByText("Test message")).toBeInTheDocument();
		});
	});

	it("should display toast with title when provided", async () => {
		function TestWithTitle() {
			const { notify } = useToast();
			return (
				<button
					onClick={() => notify({ title: "Success", body: "Operation completed", variant: "success" })}
				>
					Show Toast
				</button>
			);
		}

		const user = userEvent.setup();

		render(
			<ToastProvider>
				<TestWithTitle />
			</ToastProvider>,
		);

		const button = screen.getByText("Show Toast");
		await user.click(button);

		await waitFor(() => {
			expect(screen.getByText("Success")).toBeInTheDocument();
			expect(screen.getByText("Operation completed")).toBeInTheDocument();
		});
	});

	it("should close toast when close button is clicked", async () => {
		function TestWithTitle() {
			const { notify } = useToast();
			return (
				<button onClick={() => notify({ title: "Test", body: "Test message", variant: "success" })}>
					Show Toast
				</button>
			);
		}

		const user = userEvent.setup();

		render(
			<ToastProvider>
				<TestWithTitle />
			</ToastProvider>,
		);

		const button = screen.getByText("Show Toast");
		await user.click(button);

		await waitFor(() => {
			expect(screen.getByText("Test message")).toBeInTheDocument();
		});

		// Find and click close button (only present when title exists)
		const closeButton = screen.getByLabelText(/close/i);
		await user.click(closeButton);

		await waitFor(() => {
			expect(screen.queryByText("Test message")).not.toBeInTheDocument();
		});
	});

	it("should render multiple toasts", async () => {
		function TestMultiple() {
			const { notify } = useToast();
			return (
				<>
					<button onClick={() => notify({ body: "First message" })}>Show First</button>
					<button onClick={() => notify({ body: "Second message" })}>Show Second</button>
				</>
			);
		}

		const user = userEvent.setup();

		render(
			<ToastProvider>
				<TestMultiple />
			</ToastProvider>,
		);

		await user.click(screen.getByText("Show First"));
		await user.click(screen.getByText("Show Second"));

		await waitFor(() => {
			expect(screen.getByText("First message")).toBeInTheDocument();
			expect(screen.getByText("Second message")).toBeInTheDocument();
		});
	});
});
