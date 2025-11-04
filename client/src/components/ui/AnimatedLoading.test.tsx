/**
 * @author Bob's Garage Team
 * @purpose Component tests for AnimatedLoading component
 * @version 1.0.0
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AnimatedLoading from "./AnimatedLoading";

// Mock framer-motion to avoid animation delays in tests
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		motion: {
			div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
		},
	};
});

describe("AnimatedLoading", () => {
	it("should render spinner with border variant by default", () => {
		const { container } = render(<AnimatedLoading variant="border" />);

		const spinner = container.querySelector(".spinner-border");
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute("role", "status");
		expect(spinner).toHaveAttribute("aria-hidden", "true");
	});

	it("should render spinner with grow variant", () => {
		const { container } = render(<AnimatedLoading variant="grow" />);

		const spinner = container.querySelector(".spinner-grow");
		expect(spinner).toBeInTheDocument();
	});

	it("should render spinner with custom message", () => {
		const { container } = render(<AnimatedLoading variant="border" message="Loading data..." />);

		const spinner = container.querySelector(".spinner-border");
		expect(spinner).toBeInTheDocument();

		const message = screen.getByText("Loading data...");
		expect(message).toBeInTheDocument();
		expect(message).toHaveAttribute("aria-live", "polite");
	});

	it("should not render message when not provided", () => {
		const { container } = render(<AnimatedLoading variant="border" />);

		const spinner = container.querySelector(".spinner-border");
		expect(spinner).toBeInTheDocument();
		// Check that the visible message element is not rendered (visually-hidden text is OK)
		const messageElement = container.querySelector(".mt-3.text-muted");
		expect(messageElement).not.toBeInTheDocument();
	});

	it("should have correct structure and styling", () => {
		const { container } = render(<AnimatedLoading message="Test" />);

		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper).toHaveClass(
			"d-flex",
			"flex-column",
			"align-items-center",
			"justify-content-center",
		);
		expect(wrapper).toHaveStyle({ minHeight: "160px" });
	});
});
