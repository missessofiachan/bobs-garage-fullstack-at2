/**
 * @author Bob's Garage Team
 * @purpose Tests for ProtectedRoute and AdminRoute components
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";
import authReducer from "../slices/auth.slice";

// Mock react-router-dom Navigate component
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		Navigate: ({ to }: { to: string }) => (
			<div data-testid="navigate" data-to={to}>
				Navigate to {to}
			</div>
		),
	};
});

// Mock axios API
vi.mock("../api/axios", () => ({
	default: {
		post: vi.fn(),
	},
	setAccessToken: vi.fn(),
}));

// Mock jwt utilities
vi.mock("../api/jwt", () => ({
	decodeJwt: vi.fn(() => ({ role: "user", email: "test@example.com" })),
}));

// Mock auth utilities
vi.mock("../pages/lib/auth", () => ({
	isTokenExpired: vi.fn(() => false),
}));

describe("ProtectedRoute", () => {
	const createStore = (accessToken: string | undefined) => {
		return configureStore({
			reducer: {
				auth: authReducer,
			},
			preloadedState: {
				auth: {
					accessToken,
					role: "user" as const,
					email: "user@example.com",
				},
			},
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render children when user is authenticated", async () => {
		const store = createStore("valid-token");
		render(
			<Provider store={store}>
				<BrowserRouter>
					<ProtectedRoute>
						<div>Protected Content</div>
					</ProtectedRoute>
				</BrowserRouter>
			</Provider>,
		);

		// Wait for token verification to complete
		await waitFor(() => {
			expect(screen.getByText("Protected Content")).toBeInTheDocument();
		});
	});

	it("should redirect to /login when user is not authenticated", async () => {
		const store = createStore(undefined);
		render(
			<Provider store={store}>
				<BrowserRouter>
					<ProtectedRoute>
						<div>Protected Content</div>
					</ProtectedRoute>
				</BrowserRouter>
			</Provider>,
		);

		// Wait for token verification to complete
		await waitFor(() => {
			const navigate = screen.getByTestId("navigate");
			expect(navigate).toBeInTheDocument();
			expect(navigate).toHaveAttribute("data-to", "/login");
		});
	});

	it("should redirect when accessToken is empty string", async () => {
		const store = createStore("");
		render(
			<Provider store={store}>
				<BrowserRouter>
					<ProtectedRoute>
						<div>Protected Content</div>
					</ProtectedRoute>
				</BrowserRouter>
			</Provider>,
		);

		// Wait for token verification to complete
		await waitFor(() => {
			const navigate = screen.getByTestId("navigate");
			expect(navigate).toBeInTheDocument();
			expect(navigate).toHaveAttribute("data-to", "/login");
		});
	});
});

describe("AdminRoute", () => {
	const createStore = (accessToken: string | undefined, role: "user" | "admin" = "user") => {
		return configureStore({
			reducer: {
				auth: authReducer,
			},
			preloadedState: {
				auth: {
					accessToken,
					role,
					email: "user@example.com",
				},
			},
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render children when user is admin", async () => {
		const store = createStore("valid-token", "admin");
		render(
			<Provider store={store}>
				<BrowserRouter>
					<AdminRoute>
						<div>Admin Content</div>
					</AdminRoute>
				</BrowserRouter>
			</Provider>,
		);

		// Wait for token verification to complete
		await waitFor(() => {
			expect(screen.getByText("Admin Content")).toBeInTheDocument();
		});
	});

	it("should redirect to /login when user is not authenticated", async () => {
		const store = createStore(undefined);
		render(
			<Provider store={store}>
				<BrowserRouter>
					<AdminRoute>
						<div>Admin Content</div>
					</AdminRoute>
				</BrowserRouter>
			</Provider>,
		);

		// Wait for token verification to complete
		await waitFor(() => {
			const navigate = screen.getByTestId("navigate");
			expect(navigate).toBeInTheDocument();
			expect(navigate).toHaveAttribute("data-to", "/login");
		});
	});

	it("should redirect to / when user is not admin", async () => {
		const store = createStore("valid-token", "user");
		render(
			<Provider store={store}>
				<BrowserRouter>
					<AdminRoute>
						<div>Admin Content</div>
					</AdminRoute>
				</BrowserRouter>
			</Provider>,
		);

		// Wait for token verification to complete
		await waitFor(() => {
			const navigate = screen.getByTestId("navigate");
			expect(navigate).toBeInTheDocument();
			expect(navigate).toHaveAttribute("data-to", "/");
		});
	});

	it("should redirect to / when role is undefined", async () => {
		const store = configureStore({
			reducer: {
				auth: authReducer,
			},
			preloadedState: {
				auth: {
					accessToken: "valid-token",
					role: undefined as any,
					email: "user@example.com",
				},
			},
		});

		render(
			<Provider store={store}>
				<BrowserRouter>
					<AdminRoute>
						<div>Admin Content</div>
					</AdminRoute>
				</BrowserRouter>
			</Provider>,
		);

		// Wait for token verification to complete
		await waitFor(() => {
			const navigate = screen.getByTestId("navigate");
			expect(navigate).toBeInTheDocument();
			expect(navigate).toHaveAttribute("data-to", "/");
		});
	});
});
