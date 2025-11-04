/**
 * @author Bob's Garage Team
 * @purpose Component tests for Footer component
 * @version 1.0.0
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Footer from "./Footer";

// Mock useConnectionStatus hook
vi.mock("../hooks/useConnectionStatus", () => ({
	useConnectionStatus: vi.fn(() => ({
		api: "connected",
		db: "connected",
		apiPing: 45,
		dbPing: 32,
	})),
}));

describe("Footer", () => {
	const createWrapper = () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});

		return ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>{children}</BrowserRouter>
			</QueryClientProvider>
		);
	};

	beforeEach(() => {
		// Mock localStorage
		Storage.prototype.getItem = vi.fn(() => "dark");
		// Mock document.documentElement.getAttribute
		Object.defineProperty(document.documentElement, "getAttribute", {
			value: vi.fn(() => "dark"),
			writable: true,
		});
	});

	it("should render business information", () => {
		render(<Footer />, { wrapper: createWrapper() });

		expect(screen.getByText("Bob's Garage")).toBeInTheDocument();
		expect(screen.getByText(/123 Main Street/)).toBeInTheDocument();
		expect(screen.getByText(/\(02\) 1234 5678/)).toBeInTheDocument();
		expect(screen.getByText(/info@bobsgarage.com.au/)).toBeInTheDocument();
	});

	it("should render business hours", () => {
		render(<Footer />, { wrapper: createWrapper() });

		expect(screen.getByText(/Mon-Fri: 8AM-6PM/)).toBeInTheDocument();
		expect(screen.getByText(/Sat: 9AM-4PM/)).toBeInTheDocument();
		expect(screen.getByText(/Sun: Closed/)).toBeInTheDocument();
	});

	it("should render quick links", () => {
		render(<Footer />, { wrapper: createWrapper() });

		expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /about us/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /services/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /our team/i })).toBeInTheDocument();
	});

	it("should render social media links", () => {
		render(<Footer />, { wrapper: createWrapper() });

		const facebookLink = screen.getByRole("link", { name: /facebook/i });
		const instagramLink = screen.getByRole("link", { name: /instagram/i });

		expect(facebookLink).toBeInTheDocument();
		expect(facebookLink).toHaveAttribute("href", expect.stringContaining("facebook"));
		expect(instagramLink).toBeInTheDocument();
		expect(instagramLink).toHaveAttribute("href", expect.stringContaining("instagram"));
	});

	it("should render copyright notice with current year", () => {
		const currentYear = new Date().getFullYear();
		render(<Footer />, { wrapper: createWrapper() });

		expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
		expect(screen.getByText(/Bob's Garage/i)).toBeInTheDocument();
		expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
	});

	it("should display connection status", async () => {
		render(<Footer />, { wrapper: createWrapper() });

		await waitFor(() => {
			expect(screen.getByText(/System Status/i)).toBeInTheDocument();
			expect(screen.getByText(/API:/i)).toBeInTheDocument();
			expect(screen.getByText(/DB:/i)).toBeInTheDocument();
			expect(screen.getByText(/connected/i)).toBeInTheDocument();
		});
	});

	it("should render footer with correct semantic HTML", () => {
		render(<Footer />, { wrapper: createWrapper() });

		const footer = screen.getByRole("contentinfo");
		expect(footer).toBeInTheDocument();
		expect(footer.tagName).toBe("FOOTER");
	});

	it("should have accessible link attributes", () => {
		render(<Footer />, { wrapper: createWrapper() });

		const homeLink = screen.getByRole("link", { name: /home/i });
		expect(homeLink).toHaveAttribute("href", "/");
	});
});
