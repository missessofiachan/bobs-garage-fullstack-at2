/**
 * @author Bob's Garage Team
 * @purpose Main navigation bar with animated theme toggle and icons
 * @version 3.0.0
 */

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge, Button, Container, Nav, Navbar, NavDropdown, Spinner } from "react-bootstrap";
import { FaTools } from "react-icons/fa";
import {
	MdAccountCircle,
	MdAdminPanelSettings,
	MdBuild,
	MdContactMail,
	MdDarkMode,
	MdFavorite,
	MdHome,
	MdInfo,
	MdLightMode,
	MdLogin,
	MdLogout,
	MdPeople,
	MdPersonAdd,
	MdSettings,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { clearAccessToken } from "../api/axios";
import { useFavorites } from "../hooks/useFavorites";
import { clearAuth } from "../slices/auth.slice";
import { darkTheme, lightTheme } from "../styles/theme.css.ts";

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
	const location = useLocation();
	const { favorites } = useFavorites();

	// Check if a path is active
	const isActive = (path: string) => {
		if (path === "/") {
			return location.pathname === "/";
		}
		// Handle admin routes - /admin should be active for /admin/dashboard, /admin/services, etc.
		if (path === "/admin") {
			return location.pathname.startsWith("/admin");
		}
		return location.pathname.startsWith(path);
	};

	// Active link styling
	const activeStyle = { color: "#F7A8B8" };

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
		<Navbar
			bg={theme}
			data-bs-theme={theme}
			expand="lg"
			className="shadow-sm"
			role="navigation"
			aria-label="Main navigation"
		>
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
					{/* Public Navigation Links */}
					<Nav className="me-auto">
						<Nav.Link
							as={Link}
							to="/"
							className="d-flex align-items-center gap-1"
							style={isActive("/") ? activeStyle : undefined}
						>
							<MdHome size={18} style={isActive("/") ? activeStyle : undefined} />
							<span style={isActive("/") ? activeStyle : undefined}>Home</span>
						</Nav.Link>
						<Nav.Link
							as={Link}
							to="/about"
							className="d-flex align-items-center gap-1"
							style={isActive("/about") ? activeStyle : undefined}
						>
							<MdInfo size={18} style={isActive("/about") ? activeStyle : undefined} />
							<span style={isActive("/about") ? activeStyle : undefined}>About</span>
						</Nav.Link>
						<Nav.Link
							as={Link}
							to="/services"
							className="d-flex align-items-center gap-1"
							style={isActive("/services") ? activeStyle : undefined}
						>
							<MdBuild size={18} style={isActive("/services") ? activeStyle : undefined} />
							<span style={isActive("/services") ? activeStyle : undefined}>Services</span>
						</Nav.Link>
						<Nav.Link
							as={Link}
							to="/staff"
							className="d-flex align-items-center gap-1"
							style={isActive("/staff") ? activeStyle : undefined}
						>
							<MdPeople size={18} style={isActive("/staff") ? activeStyle : undefined} />
							<span style={isActive("/staff") ? activeStyle : undefined}>Staff</span>
						</Nav.Link>
						<Nav.Link
							as={Link}
							to="/contact"
							className="d-flex align-items-center gap-1"
							style={isActive("/contact") ? activeStyle : undefined}
						>
							<MdContactMail size={18} style={isActive("/contact") ? activeStyle : undefined} />
							<span style={isActive("/contact") ? activeStyle : undefined}>Contact</span>
						</Nav.Link>
					</Nav>

					{/* User Section - Right Side */}
					<div className="d-flex align-items-center gap-3">
						{!accessToken ? (
							<>
								{/* Not Logged In */}
								<Nav className="me-2">
									<Nav.Link
										as={Link}
										to="/login"
										className="d-flex align-items-center gap-1"
										style={isActive("/login") ? activeStyle : undefined}
									>
										<MdLogin size={18} style={isActive("/login") ? activeStyle : undefined} />
										<span style={isActive("/login") ? activeStyle : undefined}>Login</span>
									</Nav.Link>
								</Nav>
								<Nav>
									<Nav.Link
										as={Link}
										to="/register"
										className="d-flex align-items-center gap-1"
										style={isActive("/register") ? activeStyle : undefined}
									>
										<MdPersonAdd
											size={18}
											style={isActive("/register") ? activeStyle : undefined}
										/>
										<span style={isActive("/register") ? activeStyle : undefined}>Register</span>
									</Nav.Link>
								</Nav>
							</>
						) : (
							<>
								{/* Logged In User Info */}
								<div
									className="d-flex align-items-center gap-2 px-2 py-1 rounded"
									style={{ backgroundColor: "rgba(247, 168, 184, 0.1)" }}
								>
									<MdAccountCircle size={20} className="text-primary" />
									<span
										className="small fw-medium d-none d-md-inline"
										style={{ fontSize: "0.875rem" }}
									>
										{email ?? "User"}
									</span>
									{role === "admin" && (
										<Badge bg="secondary" className="ms-1" style={{ fontSize: "0.65rem" }}>
											Admin
										</Badge>
									)}
								</div>

								{/* User Navigation */}
								<Nav>
									<Nav.Link
										as={Link}
										to="/favorites"
										className="d-flex align-items-center gap-1 position-relative"
										style={isActive("/favorites") ? activeStyle : undefined}
									>
										<MdFavorite
											size={18}
											style={isActive("/favorites") ? activeStyle : undefined}
										/>
										<span
											className="d-none d-lg-inline"
											style={isActive("/favorites") ? activeStyle : undefined}
										>
											Favorites
										</span>
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
								</Nav>

								{/* Account Dropdown */}
								<NavDropdown
									title={
										<span className="d-flex align-items-center gap-1">
											<MdSettings size={18} />
										</span>
									}
									id="nav-account-dropdown"
									align="end"
								>
									<NavDropdown.Header>
										<div className="d-flex align-items-center gap-2">
											<MdAccountCircle size={24} />
											<div>
												<div className="fw-bold">{email ?? "User"}</div>
												{role === "admin" && (
													<Badge bg="secondary" style={{ fontSize: "0.7rem" }}>
														{role}
													</Badge>
												)}
											</div>
										</div>
									</NavDropdown.Header>
									<NavDropdown.Divider />
									<NavDropdown.Item
										as={Link}
										to="/profile"
										className="d-flex align-items-center gap-2"
										active={isActive("/profile")}
									>
										<MdAccountCircle
											size={18}
											style={isActive("/profile") ? activeStyle : undefined}
										/>
										<span style={isActive("/profile") ? activeStyle : undefined}>Profile</span>
									</NavDropdown.Item>
									<NavDropdown.Item
										as={Link}
										to="/settings"
										className="d-flex align-items-center gap-2"
										active={isActive("/settings")}
									>
										<MdSettings size={18} style={isActive("/settings") ? activeStyle : undefined} />
										<span style={isActive("/settings") ? activeStyle : undefined}>Settings</span>
									</NavDropdown.Item>
									{role === "admin" && (
										<>
											<NavDropdown.Divider />
											<NavDropdown.Item
												as={Link}
												to="/admin"
												className="d-flex align-items-center gap-2"
												active={isActive("/admin")}
											>
												<MdAdminPanelSettings
													size={18}
													style={isActive("/admin") ? activeStyle : undefined}
												/>
												<span style={isActive("/admin") ? activeStyle : undefined}>
													Admin Dashboard
												</span>
											</NavDropdown.Item>
										</>
									)}
									<NavDropdown.Divider />
									<NavDropdown.Item
										onClick={onLogout}
										disabled={loggingOut}
										className="d-flex align-items-center gap-2"
									>
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

						{/* Admin Link - Separate if logged in */}
						{accessToken && role === "admin" && (
							<Nav>
								<Nav.Link
									as={Link}
									to="/admin"
									className="d-flex align-items-center gap-1"
									style={isActive("/admin") ? activeStyle : undefined}
								>
									<MdAdminPanelSettings
										size={18}
										style={isActive("/admin") ? activeStyle : undefined}
									/>
									<span
										className="d-none d-lg-inline"
										style={isActive("/admin") ? activeStyle : undefined}
									>
										Admin
									</span>
								</Nav.Link>
							</Nav>
						)}

						{/* Theme Toggle */}
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
