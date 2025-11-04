/**
 * @author Bob's Garage Team
 * @purpose Unit tests for formatter utilities
 * @version 1.0.0
 */

import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatters";

describe("formatCurrency", () => {
	it("should format number as currency", () => {
		expect(formatCurrency(50)).toBe("$50.00");
		expect(formatCurrency(100.5)).toBe("$100.50");
		expect(formatCurrency(1234.99)).toBe("$1,234.99");
	});

	it("should handle zero", () => {
		expect(formatCurrency(0)).toBe("$0.00");
	});

	it("should handle negative numbers", () => {
		expect(formatCurrency(-100)).toBe("-$100.00");
	});

	it("should use custom locale and currency", () => {
		const result = formatCurrency(100, "de-DE", "EUR");
		// Accept either format due to locale differences
		expect(result).toMatch(/100.*€/);
	});
});
