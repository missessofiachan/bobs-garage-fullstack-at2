import { useCallback, useEffect, useState } from "react";
import api, { setAccessToken } from "../api/axios";
import { decodeJwt } from "../api/jwt";
import { isTokenExpired } from "../pages/lib/auth";
import { clearAuth, setAuth } from "../slices/auth.slice";
import type { RootState } from "../store/store";
import { useAppDispatch, useAppSelector } from "./hooks";

/**
 * Custom hook for handling token refresh logic
 * Extracted to follow DRY principle - used by both ProtectedRoute and AdminRoute
 */
export function useTokenRefresh() {
	const token = useAppSelector((s: RootState) => s.auth.accessToken);
	const dispatch = useAppDispatch();
	const [isChecking, setIsChecking] = useState(true);

	const checkTokenExpired = useCallback((t: string | undefined): boolean => {
		if (!t) return true;
		return isTokenExpired(t);
	}, []);

	const refreshToken = useCallback(async () => {
		if (!token) {
			setIsChecking(false);
			return;
		}

		// If token is expired, try to refresh it
		if (checkTokenExpired(token)) {
			try {
				const { data } = await api.post<{ access: string }>("/auth/refresh");
				const newToken = data.access;
				const payload = decodeJwt<{ role?: "user" | "admin"; email?: string }>(newToken) ?? {};
				setAccessToken(newToken);
				// Update Redux state with new token and decoded payload
				dispatch(
					setAuth({
						accessToken: newToken,
						role: payload.role,
						email: payload.email,
					}),
				);
			} catch {
				// Refresh failed, clear auth state
				dispatch(clearAuth());
			}
		}
		setIsChecking(false);
	}, [token, dispatch, checkTokenExpired]);

	useEffect(() => {
		refreshToken();
	}, [refreshToken]);

	return {
		token,
		isChecking,
		isTokenExpired: checkTokenExpired(token),
	};
}
