/**
 * @author Bob's Garage Team
 * @purpose Component tests for Select component
 * @version 1.0.0
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Select from "./Select";

describe("Select", () => {
	it("should render label", () => {
		render(
			<Select label="Country" name="country">
				<option value="">Select...</option>
				<option value="us">United States</option>
			</Select>,
		);

		expect(screen.getByText("Country")).toBeInTheDocument();
	});

	it("should render select field", () => {
		render(
			<Select label="Country" name="country" id="country">
				<option value="">Select...</option>
			</Select>,
		);

		const select = screen.getByRole("combobox") as HTMLSelectElement;
		expect(select).toBeInTheDocument();
		expect(select.tagName).toBe("SELECT");
		expect(select).toHaveAttribute("name", "country");
	});

	it("should pass select attributes to select element", () => {
		render(
			<Select label="Country" name="country" id="country" required>
				<option value="">Select...</option>
			</Select>,
		);

		const select = screen.getByRole("combobox") as HTMLSelectElement;
		expect(select).toHaveAttribute("name", "country");
		expect(select).toHaveAttribute("required");
	});

	it("should display error message when error is provided", () => {
		render(
			<Select label="Country" name="country" id="country" error="Country is required">
				<option value="">Select...</option>
			</Select>,
		);

		expect(screen.getByText("Country is required")).toBeInTheDocument();
		const select = screen.getByRole("combobox");
		expect(select).toHaveClass("is-invalid");
	});

	it("should not display error message when error is not provided", () => {
		render(
			<Select label="Country" name="country" id="country">
				<option value="">Select...</option>
			</Select>,
		);

		expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
		const select = screen.getByRole("combobox");
		expect(select).not.toHaveClass("is-invalid");
	});

	it("should display hint when provided", () => {
		render(
			<Select label="Country" name="country" hint="Select your country of residence">
				<option value="">Select...</option>
			</Select>,
		);

		expect(screen.getByText("Select your country of residence")).toBeInTheDocument();
	});

	it("should not display hint when not provided", () => {
		render(
			<Select label="Country" name="country">
				<option value="">Select...</option>
			</Select>,
		);

		expect(screen.queryByText(/residence/i)).not.toBeInTheDocument();
	});

	it("should handle selection changes", async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();

		render(
			<Select label="Country" name="country" id="country" onChange={onChange}>
				<option value="">Select...</option>
				<option value="us">United States</option>
				<option value="uk">United Kingdom</option>
			</Select>,
		);

		const select = screen.getByRole("combobox");
		await user.selectOptions(select, "us");

		expect(onChange).toHaveBeenCalled();
	});

	it("should support controlled select", () => {
		render(
			<Select label="Country" name="country" id="country" value="us">
				<option value="">Select...</option>
				<option value="us">United States</option>
			</Select>,
		);

		const select = screen.getByRole("combobox") as HTMLSelectElement;
		expect(select.value).toBe("us");
	});

	it("should render hint as ReactNode", () => {
		render(
			<Select
				label="Country"
				name="country"
				id="country"
				hint={<span className="custom-hint">Custom hint</span>}
			>
				<option value="">Select...</option>
			</Select>,
		);

		const hint = screen.getByText("Custom hint");
		expect(hint).toBeInTheDocument();
		expect(hint).toHaveClass("custom-hint");
	});

	it("should render label as ReactNode", () => {
		render(
			<Select
				label={<span className="custom-label">Custom Label</span>}
				name="country"
				id="country"
			>
				<option value="">Select...</option>
			</Select>,
		);

		const label = screen.getByText("Custom Label");
		expect(label).toBeInTheDocument();
		expect(label).toHaveClass("custom-label");
	});

	it("should render children options", () => {
		render(
			<Select label="Country" name="country">
				<option value="">Select...</option>
				<option value="us">United States</option>
				<option value="uk">United Kingdom</option>
			</Select>,
		);

		expect(screen.getByText("United States")).toBeInTheDocument();
		expect(screen.getByText("United Kingdom")).toBeInTheDocument();
	});
});
