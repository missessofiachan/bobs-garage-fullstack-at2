import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { setAccessToken } from "../api/axios";
import { decodeJwt } from "../api/jwt";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { isTokenExpired } from "../pages/lib/auth";
import { clearAuth, setAuth } from "../slices/auth.slice";
import type { RootState } from "../store/store";

// Helper to check if token is expired
function checkTokenExpired(token: string | undefined): boolean {
	if (!token) return true;
	return isTokenExpired(token);
}

export function ProtectedRoute({ children }: { children: ReactElement }) {
	const token = useAppSelector((s: RootState) => s.auth.accessToken);
	const dispatch = useAppDispatch();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		const verifyToken = async () => {
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
		};

		verifyToken();
	}, [token, dispatch]);

	if (isChecking) {
		// Show loading state while checking token
		return <div>Loading...</div>;
	}

	if (!token || checkTokenExpired(token)) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

export function AdminRoute({ children }: { children: ReactElement }) {
	const { accessToken, role } = useAppSelector((s: RootState) => s.auth);
	const dispatch = useAppDispatch();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		const verifyToken = async () => {
			if (!accessToken) {
				setIsChecking(false);
				return;
			}

			// If token is expired, try to refresh it
			if (checkTokenExpired(accessToken)) {
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
		};

		verifyToken();
	}, [accessToken, dispatch]);

	if (isChecking) {
		// Show loading state while checking token
		return <div>Loading...</div>;
	}

	if (!accessToken || checkTokenExpired(accessToken)) {
		return <Navigate to="/login" replace />;
	}

	if (role !== "admin") {
		return <Navigate to="/" replace />;
	}

	return children;
}

export default ProtectedRoute;
