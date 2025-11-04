/**
 * @author Bob's Garage Team
 * @purpose Component tests for TextField component
 * @version 1.0.0
 */

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TextField from "./TextField";

describe("TextField", () => {
	it("should render label", () => {
		render(<TextField label="Email" name="email" />);

		expect(screen.getByText("Email")).toBeInTheDocument();
	});

	it("should render input field", () => {
		render(<TextField label="Email" name="email" id="email" />);

		const input = screen.getByRole("textbox") as HTMLInputElement;
		expect(input).toBeInTheDocument();
		expect(input.tagName).toBe("INPUT");
		expect(input).toHaveAttribute("name", "email");
	});

	it("should pass input attributes to input element", () => {
		render(
			<TextField
				label="Email"
				name="email"
				id="email"
				type="email"
				placeholder="Enter email"
				required
			/>,
		);

		const input = screen.getByRole("textbox") as HTMLInputElement;
		expect(input).toHaveAttribute("type", "email");
		expect(input).toHaveAttribute("placeholder", "Enter email");
		expect(input).toHaveAttribute("required");
	});

	it("should display error message when error is provided", () => {
		render(<TextField label="Email" name="email" id="email" error="Email is required" />);

		expect(screen.getByText("Email is required")).toBeInTheDocument();
		const input = screen.getByRole("textbox");
		expect(input).toHaveClass("is-invalid");
	});

	it("should not display error message when error is not provided", () => {
		render(<TextField label="Email" name="email" id="email" />);

		expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
		const input = screen.getByRole("textbox");
		expect(input).not.toHaveClass("is-invalid");
	});

	it("should display hint when provided", () => {
		render(<TextField label="Password" name="password" hint="Must be at least 8 characters" />);

		expect(screen.getByText("Must be at least 8 characters")).toBeInTheDocument();
	});

	it("should not display hint when not provided", () => {
		render(<TextField label="Password" name="password" />);

		expect(screen.queryByText(/characters/i)).not.toBeInTheDocument();
	});

	it("should handle input changes", async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();

		render(<TextField label="Email" name="email" id="email" onChange={onChange} />);

		const input = screen.getByRole("textbox");
		await user.type(input, "test@example.com");

		expect(onChange).toHaveBeenCalled();
	});

	it("should support controlled input", () => {
		render(<TextField label="Email" name="email" id="email" value="test@example.com" readOnly />);

		const input = screen.getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("test@example.com");
	});

	it("should render hint as ReactNode", () => {
		render(
			<TextField
				label="Email"
				name="email"
				hint={<span className="custom-hint">Custom hint</span>}
			/>,
		);

		const hint = screen.getByText("Custom hint");
		expect(hint).toBeInTheDocument();
		expect(hint).toHaveClass("custom-hint");
	});

	it("should render label as ReactNode", () => {
		render(<TextField label={<span className="custom-label">Custom Label</span>} name="email" />);

		const label = screen.getByText("Custom Label");
		expect(label).toBeInTheDocument();
		expect(label).toHaveClass("custom-label");
	});
});
