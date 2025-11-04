/**
 * @author Bob's Garage Team
 * @purpose Main navigation bar with animated theme toggle and icons
 * @version 3.0.0
 */

import { Container, Nav, Navbar, Button, NavDropdown, Spinner, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
	MdHome,
	MdInfo,
	MdBuild,
	MdPeople,
	MdLogin,
	MdPersonAdd,
	MdAccountCircle,
	MdSettings,
	MdLogout,
	MdAdminPanelSettings,
	MdDarkMode,
	MdLightMode,
	MdFavorite,
} from "react-icons/md";
import { FaTools } from "react-icons/fa";
import { clearAuth } from "../slices/auth.slice";
import api, { clearAccessToken } from "../api/axios";
import { lightTheme, darkTheme } from "../styles/theme.css.ts";
import { useFavorites } from "../hooks/useFavorites";

export default function NavBar() {
	const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "dark");

	useEffect(() => {
		// bootstrap supports data-bs-theme on html/body
		document.documentElement.setAttribute("data-bs-theme", theme);
		localStorage.setItem("theme", theme);
		// apply vanilla-extract theme class on <html>
		document.documentElement.classList.remove(lightTheme, darkTheme);
		document.documentElement.classList.add(theme === "light" ? lightTheme : darkTheme);
		// Dispatch custom event so other components can react
		window.dispatchEvent(new Event("themechange"));
	}, [theme]);

	const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

	const { accessToken, role, email } = useSelector((s: any) => s.auth);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { favorites } = useFavorites();

	const [loggingOut, setLoggingOut] = useState(false);

	const onLogout = async () => {
		setLoggingOut(true);
		try {
			await api.post("/auth/logout");
		} catch {
			// ignore server errors
		} finally {
			clearAccessToken();
			dispatch(clearAuth());
			setLoggingOut(false);
			navigate("/");
		}
	};

	return (
		<Navbar bg={theme} data-bs-theme={theme} expand="lg" className="shadow-sm" role="navigation" aria-label="Main navigation">
			<Container>
				<Navbar.Brand
					as={Link}
					to="/"
					className="d-flex align-items-center gap-2 fw-bold"
					style={{ textDecoration: "none", outline: "none", boxShadow: "none" }}
				>
					<motion.div
						whileHover={{ rotate: 15, scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 10 }}
					>
						<FaTools size={28} className="text-primary" />
					</motion.div>
					<span>Bob's Garage</span>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link as={Link} to="/" className="d-flex align-items-center gap-1">
							<MdHome size={18} />
							<span>Home</span>
						</Nav.Link>
						<Nav.Link as={Link} to="/about" className="d-flex align-items-center gap-1">
							<MdInfo size={18} />
							<span>About</span>
						</Nav.Link>
						<Nav.Link as={Link} to="/services" className="d-flex align-items-center gap-1">
							<MdBuild size={18} />
							<span>Services</span>
						</Nav.Link>
						<Nav.Link as={Link} to="/staff" className="d-flex align-items-center gap-1">
							<MdPeople size={18} />
							<span>Staff</span>
						</Nav.Link>
						{!accessToken ? (
							<>
								<Nav.Link as={Link} to="/login" className="d-flex align-items-center gap-1">
									<MdLogin size={18} />
									<span>Login</span>
								</Nav.Link>
								<Nav.Link as={Link} to="/register" className="d-flex align-items-center gap-1">
									<MdPersonAdd size={18} />
									<span>Register</span>
								</Nav.Link>
							</>
						) : (
							<>
								<Nav.Link as={Link} to="/favorites" className="d-flex align-items-center gap-1 position-relative">
									<MdFavorite size={18} />
									<span>Favorites</span>
									{favorites.length > 0 && (
										<Badge
											bg="secondary"
											className="position-absolute top-0 start-100 translate-middle rounded-pill"
											style={{ fontSize: "0.65rem", padding: "2px 5px" }}
										>
											{favorites.length}
										</Badge>
									)}
								</Nav.Link>
								<NavDropdown
									title={
										<span className="d-flex align-items-center gap-1">
											<MdAccountCircle size={18} />
											<span>{email ?? "Account"}</span>
										</span>
									}
									id="nav-account-dropdown"
								>
									<NavDropdown.Item as={Link} to="/profile" className="d-flex align-items-center gap-2">
										<MdAccountCircle size={18} />
										Profile
									</NavDropdown.Item>
									<NavDropdown.Item as={Link} to="/settings" className="d-flex align-items-center gap-2">
										<MdSettings size={18} />
										Settings
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item onClick={onLogout} disabled={loggingOut} className="d-flex align-items-center gap-2">
										{loggingOut ? (
											<>
												<Spinner size="sm" animation="border" role="status" aria-hidden="true" />
												<span>Logging out…</span>
											</>
										) : (
											<>
												<MdLogout size={18} />
												<span>Logout</span>
											</>
										)}
									</NavDropdown.Item>
								</NavDropdown>
							</>
						)}
						{role === "admin" && (
							<Nav.Link as={Link} to="/admin" className="d-flex align-items-center gap-1">
								<MdAdminPanelSettings size={18} className="text-warning" />
								<span>Admin</span>
							</Nav.Link>
						)}
					</Nav>
					<div className="d-flex align-items-center gap-2">
						<motion.div
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							<Button
								size="sm"
								variant={theme === "dark" ? "outline-light" : "outline-dark"}
								onClick={toggleTheme}
								className="d-flex align-items-center gap-1"
								aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
							>
								{theme === "dark" ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
								<span className="d-none d-sm-inline" style={{ fontSize: 12 }}>
									{theme === "dark" ? "Light" : "Dark"}
								</span>
							</Button>
						</motion.div>
					</div>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
