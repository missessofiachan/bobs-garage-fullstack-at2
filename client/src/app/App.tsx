/**
 * @file App.tsx
 * @author Bob's Garage Team
 * @description Root React application component providing routing, theme management (light/dark mode),
 *              error boundary, and lazy-loaded page components. Main entry point for the client application.
 * @version 2.0.0
 * @since 1.0.0
 */

import { Suspense, lazy, useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import ProtectedRoute, { AdminRoute } from "../routes/ProtectedRoute";
import NavBar from "../components/NavBar";
import ErrorBoundary from "../pages/Error";
import Loading from "../components/ui/Loading";
import ScrollToTop from "./ScrollToTop.tsx";
import Footer from "../components/Footer";
import { lightTheme, darkTheme } from "../styles/theme.css.ts";
import {
	fontSizeSmall,
	fontSizeMedium,
	fontSizeLarge,
	densityComfortable,
	densityCompact,
	highContrast,
	reducedMotion,
} from "../styles/preferences.css";

// Lazy-load pages to reduce initial bundle size
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Services = lazy(() => import("../pages/Services"));
const Staff = lazy(() => import("../pages/Staff"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const ServicesAdmin = lazy(() => import("../pages/Admin/ServicesAdmin"));
const StaffAdmin = lazy(() => import("../pages/Admin/StaffAdmin"));
const UsersAdmin = lazy(() => import("../pages/Admin/UsersAdmin"));
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const Favorites = lazy(() => import("../pages/Favorites"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const Accessibility = lazy(() => import("../pages/Accessibility"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const NotFound = lazy(() => import("../pages/NotFound"));

export default function App() {
	const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "dark");
	const preferences = useSelector((s: RootState) => s.preferences);

	useEffect(() => {
		// Sync theme with localStorage changes (e.g., from NavBar toggle)
		const handleStorageChange = () => {
			const storedTheme = localStorage.getItem("theme") || "dark";
			setTheme(storedTheme);
		};

		// Listen for storage events (cross-tab sync)
		window.addEventListener("storage", handleStorageChange);

		// Check for initial theme
		handleStorageChange();

		// Also listen for custom theme change events
		const handleThemeChange = () => handleStorageChange();
		window.addEventListener("themechange", handleThemeChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("themechange", handleThemeChange);
		};
	}, []);

	// Apply preference classes to root element
	useEffect(() => {
		const root = document.documentElement;

		// Font size
		root.classList.remove(fontSizeSmall, fontSizeMedium, fontSizeLarge);
		if (preferences.fontSize === "small") {
			root.classList.add(fontSizeSmall);
		} else if (preferences.fontSize === "large") {
			root.classList.add(fontSizeLarge);
		} else {
			root.classList.add(fontSizeMedium);
		}

		// Density
		root.classList.remove(densityComfortable, densityCompact);
		if (preferences.density === "compact") {
			root.classList.add(densityCompact);
		} else {
			root.classList.add(densityComfortable);
		}

		// Accessibility
		if (preferences.accessibilityHighContrast) {
			root.classList.add(highContrast);
		} else {
			root.classList.remove(highContrast);
		}

		// Reduced motion: either from accessibility setting or animations disabled
		if (preferences.accessibilityReducedMotion || !preferences.animationsEnabled) {
			root.classList.add(reducedMotion);
		} else {
			root.classList.remove(reducedMotion);
		}
	}, [preferences]);

	return (
		<div
			className={theme === "light" ? lightTheme : darkTheme}
			style={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			{/* Skip to main content link for keyboard navigation */}
			<a
				href="#main-content"
				className="visually-hidden-focusable position-absolute top-0 start-0 p-3 bg-primary text-white text-decoration-none"
				style={{ zIndex: 9999 }}
				onFocus={(e) => e.currentTarget.classList.remove("visually-hidden-focusable")}
				onBlur={(e) => e.currentTarget.classList.add("visually-hidden-focusable")}
			>
				Skip to main content
			</a>
			<NavBar />
			<ErrorBoundary>
				<ScrollToTop />
				<Container id="main-content" className="py-4" style={{ flex: 1 }} role="main">
					<Suspense fallback={<Loading message="Loading page…" />}>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/about" element={<About />} />
							<Route path="/services" element={<Services />} />
							<Route path="/staff" element={<Staff />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path="/forgot-password" element={<ForgotPassword />} />
							<Route
								path="/admin"
								element={
									<AdminRoute>
										<Navigate to="/admin/dashboard" replace />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/dashboard"
								element={
									<AdminRoute>
										<Dashboard />
									</AdminRoute>
								}
							/>
							<Route
								path="/profile"
								element={
									<ProtectedRoute>
										<Profile />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/settings"
								element={
									<ProtectedRoute>
										<Settings />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/favorites"
								element={
									<ProtectedRoute>
										<Favorites />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/admin/services"
								element={
									<AdminRoute>
										<ServicesAdmin />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/staff"
								element={
									<AdminRoute>
										<StaffAdmin />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/users"
								element={
									<AdminRoute>
										<UsersAdmin />
									</AdminRoute>
								}
							/>
							<Route path="/privacy-policy" element={<PrivacyPolicy />} />
							<Route path="/terms-of-service" element={<TermsOfService />} />
							<Route path="/accessibility" element={<Accessibility />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					</Suspense>
				</Container>
			</ErrorBoundary>
			<Footer />
		</div>
	);
}
