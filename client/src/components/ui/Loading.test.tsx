/**
 * @author Bob's Garage Team
 * @purpose Component tests for Loading component
 * @version 1.0.0
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "./Loading";

describe("Loading", () => {
	it("should render spinner with default message", () => {
		const { container } = render(<Loading />);

		const spinner = container.querySelector(".trans-pride-spinner");
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute("role", "status");
		expect(spinner).toHaveAttribute("aria-hidden", "true");
	});

	it("should render spinner with custom message", () => {
		const { container } = render(<Loading message="Loading data..." />);

		const spinner = container.querySelector(".trans-pride-spinner");
		expect(spinner).toBeInTheDocument();

		const message = screen.getByText("Loading data...");
		expect(message).toBeInTheDocument();
		expect(message).toHaveAttribute("aria-live", "polite");
	});

	it("should not render message when not provided", () => {
		const { container } = render(<Loading />);

		// Spinner is in the document
		const spinner = container.querySelector(".trans-pride-spinner");
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute("role", "status");
		// Check that the visible message element is not rendered (visually-hidden text is OK)
		const messageElement = container.querySelector(".mt-3.text-muted");
		expect(messageElement).not.toBeInTheDocument();
	});

	it("should have correct structure and styling", () => {
		const { container } = render(<Loading message="Test" />);

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
