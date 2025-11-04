/**
 * @author Bob's Garage Team
 * @purpose Component tests for Select component
 * @version 1.0.0
 */

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Select from "./Select";

describe("Select", () => {
	it("should render with label", () => {
		render(
			<Select label="Country" name="country" id="country">
				<option value="">Select a country</option>
				<option value="us">United States</option>
			</Select>,
		);

		expect(screen.getByLabelText("Country")).toBeInTheDocument();
		expect(screen.getByRole("combobox", { name: /country/i })).toBeInTheDocument();
	});

	it("should render options", () => {
		render(
			<Select label="Country" name="country">
				<option value="">Select a country</option>
				<option value="us">United States</option>
				<option value="uk">United Kingdom</option>
			</Select>,
		);

		expect(screen.getByText("Select a country")).toBeInTheDocument();
		expect(screen.getByText("United States")).toBeInTheDocument();
		expect(screen.getByText("United Kingdom")).toBeInTheDocument();
	});

	it("should display error message when error prop is provided", () => {
		render(
			<Select label="Country" name="country" error="Country is required" id="country">
				<option value="">Select a country</option>
			</Select>,
		);

		expect(screen.getByText("Country is required")).toBeInTheDocument();
		const select = screen.getByRole("combobox", { name: /country/i });
		expect(select).toHaveClass("is-invalid");
	});

	it("should display hint text when hint prop is provided", () => {
		render(
			<Select label="Country" name="country" hint="Select your country of residence">
				<option value="">Select a country</option>
			</Select>,
		);

		expect(screen.getByText("Select your country of residence")).toBeInTheDocument();
	});

	it("should not display error when error is not provided", () => {
		render(
			<Select label="Country" name="country" id="country">
				<option value="">Select a country</option>
			</Select>,
		);

		const select = screen.getByRole("combobox", { name: /country/i });
		expect(select).not.toHaveClass("is-invalid");
	});

	it("should handle user selection", async () => {
		const user = userEvent.setup();
		render(
			<Select label="Country" name="country" id="country">
				<option value="">Select a country</option>
				<option value="us">United States</option>
				<option value="uk">United Kingdom</option>
			</Select>,
		);

		const select = screen.getByRole("combobox", { name: /country/i }) as HTMLSelectElement;
		await user.selectOptions(select, "us");

		expect(select.value).toBe("us");
	});

	it("should be disabled when disabled prop is provided", () => {
		render(
			<Select label="Country" name="country" disabled id="country">
				<option value="">Select a country</option>
			</Select>,
		);

		const select = screen.getByRole("combobox", { name: /country/i }) as HTMLSelectElement;
		expect(select).toBeDisabled();
	});

	it("should have correct value when value prop is provided", () => {
		render(
			<Select label="Country" name="country" value="us" id="country">
				<option value="">Select a country</option>
				<option value="us">United States</option>
			</Select>,
		);

		const select = screen.getByRole("combobox", { name: /country/i }) as HTMLSelectElement;
		expect(select.value).toBe("us");
	});

	it("should accept HTML select attributes", () => {
		render(
			<Select label="Country" name="country" id="country-select" required multiple>
				<option value="">Select a country</option>
			</Select>,
		);

		const select = screen.getByRole("combobox", { name: /country/i }) as HTMLSelectElement;
		expect(select).toHaveAttribute("id", "country-select");
		expect(select).toBeRequired();
		expect(select).toHaveAttribute("multiple");
	});

	it("should render with React node as label", () => {
		render(
			<Select
				label={
					<>
						Country <span className="text-danger">*</span>
					</>
				}
				name="country"
				id="country"
			>
				<option value="">Select a country</option>
			</Select>,
		);

		const label = screen.getByText(/Country/);
		expect(label).toBeInTheDocument();
		expect(screen.getByText("*")).toBeInTheDocument();
	});
});
