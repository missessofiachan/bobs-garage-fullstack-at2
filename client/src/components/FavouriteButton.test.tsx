/**
 * @author Bob's Garage Team
 * @purpose Component tests for FavouriteButton
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import FavouriteButton from "./FavouriteButton";
import authReducer from "../slices/auth.slice";

// Mock framer-motion to avoid animation delays in tests
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		motion: {
			div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
		},
	};
});

// Mock useFavorites hook
vi.mock("../hooks/useFavorites", () => ({
	useFavorites: vi.fn(),
}));

// Mock ToastProvider
vi.mock("../components/ui/ToastProvider", () => ({
	useToast: () => ({
		notify: vi.fn(),
	}),
}));

import { useFavorites } from "../hooks/useFavorites";

describe("FavouriteButton", () => {
	const mockUseFavorites = useFavorites as ReturnType<typeof vi.fn>;
	const mockAddFavorite = vi.fn();
	const mockRemoveFavorite = vi.fn();
	const mockIsFavorite = vi.fn();

	const createStore = () => {
		return configureStore({
			reducer: {
				auth: authReducer,
			},
			preloadedState: {
				auth: {
					accessToken: "test-token",
					role: "user",
					email: "test@example.com",
				},
			},
		});
	};

	const createWrapper = () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});

		return ({ children }: { children: React.ReactNode }) => (
			<Provider store={createStore()}>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			</Provider>
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockIsFavorite.mockReturnValue(false);
		mockUseFavorites.mockReturnValue({
			isFavorite: mockIsFavorite,
			addFavorite: mockAddFavorite,
			removeFavorite: mockRemoveFavorite,
			favorites: [],
			isLoading: false,
		});
	});

	it("should render unfavorited state by default", () => {
		render(<FavouriteButton id={1} />, { wrapper: createWrapper() });

		const button = screen.getByRole("button", { name: /add to favourites/i });
		expect(button).toBeInTheDocument();
	});

	it("should render favorited state when item is favorited", () => {
		mockIsFavorite.mockReturnValue(true);
		render(<FavouriteButton id={1} />, { wrapper: createWrapper() });

		const button = screen.getByRole("button", { name: /remove from favourites/i });
		expect(button).toBeInTheDocument();
	});

	it("should call addFavorite on click when not favorited", async () => {
		const { userEvent } = await import("@testing-library/user-event");
		const user = userEvent.setup();

		mockAddFavorite.mockResolvedValue({});

		render(<FavouriteButton id={1} />, { wrapper: createWrapper() });

		const button = screen.getByRole("button", { name: /add to favourites/i });
		await user.click(button);

		await waitFor(() => {
			expect(mockAddFavorite).toHaveBeenCalledWith(1);
		});
	});

	it("should call removeFavorite on click when favorited", async () => {
		const { userEvent } = await import("@testing-library/user-event");
		const user = userEvent.setup();

		mockIsFavorite.mockReturnValue(true);
		mockRemoveFavorite.mockResolvedValue(undefined);

		render(<FavouriteButton id={1} />, { wrapper: createWrapper() });

		const button = screen.getByRole("button", { name: /remove from favourites/i });
		await user.click(button);

		await waitFor(() => {
			expect(mockRemoveFavorite).toHaveBeenCalledWith(1);
		});
	});
});
