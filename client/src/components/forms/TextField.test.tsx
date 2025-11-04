/**
 * @author Bob's Garage Team
 * @purpose Component tests for TextField component
 * @version 1.0.0
 */

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import TextField from "./TextField";

describe("TextField", () => {
	it("should render with label", () => {
		render(<TextField label="Email" name="email" id="email" />);

		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
	});

	it("should render input with correct type", () => {
		render(<TextField label="Email" name="email" type="email" id="email" />);

		const input = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
		expect(input.type).toBe("email");
	});

	it("should render with placeholder", () => {
		render(<TextField label="Email" name="email" placeholder="Enter your email" id="email" />);

		const input = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
		expect(input.placeholder).toBe("Enter your email");
	});

	it("should display error message when error prop is provided", () => {
		render(<TextField label="Email" name="email" error="Email is required" id="email" />);

		expect(screen.getByText("Email is required")).toBeInTheDocument();
		const input = screen.getByRole("textbox", { name: /email/i });
		expect(input).toHaveClass("is-invalid");
	});

	it("should display hint text when hint prop is provided", () => {
		render(<TextField label="Password" name="password" hint="Must be at least 8 characters" />);

		expect(screen.getByText("Must be at least 8 characters")).toBeInTheDocument();
	});

	it("should not display error when error is not provided", () => {
		render(<TextField label="Email" name="email" id="email" />);

		const input = screen.getByRole("textbox", { name: /email/i });
		expect(input).not.toHaveClass("is-invalid");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("should handle user input", async () => {
		const user = userEvent.setup();
		render(<TextField label="Email" name="email" id="email" />);

		const input = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
		await user.type(input, "test@example.com");

		expect(input.value).toBe("test@example.com");
	});

	it("should be disabled when disabled prop is provided", () => {
		render(<TextField label="Email" name="email" disabled id="email" />);

		const input = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
		expect(input).toBeDisabled();
	});

	it("should have correct value when value prop is provided", () => {
		render(<TextField label="Email" name="email" value="test@example.com" readOnly id="email" />);

		const input = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
		expect(input.value).toBe("test@example.com");
	});

	it("should accept HTML input attributes", () => {
		render(
			<TextField
				label="Email"
				name="email"
				id="email-input"
				autoComplete="email"
				required
				aria-label="Email address"
			/>,
		);

		const input = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
		expect(input).toHaveAttribute("id", "email-input");
		expect(input).toHaveAttribute("autoComplete", "email");
		expect(input).toBeRequired();
		expect(input).toHaveAttribute("aria-label", "Email address");
	});

	it("should render with React node as label", () => {
		render(
			<TextField
				label={
					<>
						Email <span className="text-danger">*</span>
					</>
				}
				name="email"
			/>,
		);

		const label = screen.getByText(/Email/);
		expect(label).toBeInTheDocument();
		expect(screen.getByText("*")).toBeInTheDocument();
	});
});
