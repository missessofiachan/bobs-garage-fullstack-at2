import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import { useTokenRefresh } from "../hooks/useTokenRefresh";

export function ProtectedRoute({ children }: { children: ReactElement }) {
	const { token, isChecking, isTokenExpired } = useTokenRefresh();

	if (isChecking) {
		// Show loading state while checking token
		return <div>Loading...</div>;
	}

	if (!token || isTokenExpired) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

export function AdminRoute({ children }: { children: ReactElement }) {
	const { token, isChecking, isTokenExpired } = useTokenRefresh();
	const role = useAppSelector((s) => s.auth.role);

	if (isChecking) {
		// Show loading state while checking token
		return <div>Loading...</div>;
	}

	if (!token || isTokenExpired) {
		return <Navigate to="/login" replace />;
	}

	if (role !== "admin") {
		return <Navigate to="/" replace />;
	}

	return children;
}

export default ProtectedRoute;
