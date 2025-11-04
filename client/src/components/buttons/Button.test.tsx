/**
 * @author Bob's Garage Team
 * @purpose Component tests for DSButton component
 * @version 1.0.0
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import DSButton from "./Button";

describe("DSButton", () => {
	it("should render button with default props", () => {
		render(<DSButton>Click me</DSButton>);

		const button = screen.getByText("Click me");
		expect(button).toBeInTheDocument();
		expect(button.tagName).toBe("BUTTON");
	});

	it("should render with primary tone by default", () => {
		render(<DSButton>Primary</DSButton>);

		const button = screen.getByText("Primary");
		// The button should have the primary variant class from button.css.ts
		expect(button).toBeInTheDocument();
	});

	it("should render with different tones", () => {
		const { rerender } = render(<DSButton tone="primary">Primary</DSButton>);
		expect(screen.getByText("Primary")).toBeInTheDocument();

		rerender(<DSButton tone="outline">Outline</DSButton>);
		expect(screen.getByText("Outline")).toBeInTheDocument();

		rerender(<DSButton tone="subtle">Subtle</DSButton>);
		expect(screen.getByText("Subtle")).toBeInTheDocument();
	});

	it("should render with different sizes", () => {
		const { rerender } = render(<DSButton sz="sm">Small</DSButton>);
		expect(screen.getByText("Small")).toBeInTheDocument();

		rerender(<DSButton sz="md">Medium</DSButton>);
		expect(screen.getByText("Medium")).toBeInTheDocument();

		rerender(<DSButton sz="lg">Large</DSButton>);
		expect(screen.getByText("Large")).toBeInTheDocument();
	});

	it("should handle click events", async () => {
		const onClick = vi.fn();
		const user = userEvent.setup();

		render(<DSButton onClick={onClick}>Click me</DSButton>);

		const button = screen.getByText("Click me");
		await user.click(button);

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("should pass HTML button attributes", () => {
		render(
			<DSButton type="submit" disabled aria-label="Submit form">
				Submit
			</DSButton>,
		);

		const button = screen.getByText("Submit") as HTMLButtonElement;
		expect(button).toHaveAttribute("type", "submit");
		expect(button).toHaveAttribute("disabled");
		expect(button).toHaveAttribute("aria-label", "Submit form");
	});

	it("should merge custom className with variant classes", () => {
		render(<DSButton className="custom-class">Button</DSButton>);

		const button = screen.getByText("Button");
		expect(button).toHaveClass("custom-class");
	});

	it("should handle disabled state", () => {
		render(<DSButton disabled>Disabled</DSButton>);

		const button = screen.getByText("Disabled") as HTMLButtonElement;
		expect(button).toBeDisabled();
	});

	it("should render children correctly", () => {
		render(
			<DSButton>
				<span>Icon</span> Text
			</DSButton>,
		);

		expect(screen.getByText("Icon")).toBeInTheDocument();
		expect(screen.getByText("Text")).toBeInTheDocument();
	});

	it("should handle all button HTML attributes", () => {
		render(
			<DSButton id="test-button" name="test" form="test-form" value="test-value" autoFocus>
				Test
			</DSButton>,
		);

		const button = screen.getByText("Test") as HTMLButtonElement;
		expect(button).toHaveAttribute("id", "test-button");
		expect(button).toHaveAttribute("name", "test");
		expect(button).toHaveAttribute("form", "test-form");
		expect(button).toHaveAttribute("value", "test-value");
	});
});
