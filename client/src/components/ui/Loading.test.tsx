/**
 * @author Bob's Garage Team
 * @purpose Component tests for Loading component
 * @version 1.0.0
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "./Loading";

describe("Loading", () => {
	it("should render with default message", () => {
		render(<Loading />);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("should render with custom message", () => {
		render(<Loading message="Fetching data..." />);

		expect(screen.getByText("Fetching data...")).toBeInTheDocument();
		// The "Loading..." text is always present as visually-hidden text
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("should render spinner", () => {
		const { container } = render(<Loading />);

		const spinner = container.querySelector(".trans-pride-spinner");
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute("role", "status");
		expect(spinner).toHaveAttribute("aria-hidden", "true");
	});

	it("should have accessible loading text", () => {
		const { container } = render(<Loading message="Please wait" />);

		const spinner = container.querySelector(".trans-pride-spinner");
		expect(spinner).toHaveAttribute("role", "status");
		expect(spinner).toHaveAttribute("aria-hidden", "true");

		// Check for visually hidden text
		const hiddenText = screen.getByText("Loading...");
		expect(hiddenText).toHaveClass("visually-hidden");
	});

	it("should render without visible message when message is not provided", () => {
		const { container } = render(<Loading />);

		const spinner = container.querySelector(".trans-pride-spinner");
		expect(spinner).toBeInTheDocument();
		// The "Loading..." text is always present as visually-hidden text
		expect(screen.getByText("Loading...")).toBeInTheDocument();
		// But no visible message element should be rendered
		const messageElement = container.querySelector(".mt-3.text-muted");
		expect(messageElement).not.toBeInTheDocument();
	});
});
