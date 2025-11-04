/**
 * @file Footer.tsx
 * @author Bob's Garage Team
 * @description Footer component displaying contact information, social media links, and real-time
 *              connection status indicators for API and database connectivity with trans pride theme.
 * @version 2.0.0
 * @since 1.0.0
 */

import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdLocalPhone, MdLocationOn, MdSchedule } from "react-icons/md";
import { Link } from "react-router-dom";
import { useConnectionStatus } from "../hooks/useConnectionStatus";

export default function Footer() {
	const { api, db, apiPing, dbPing } = useConnectionStatus(5000);
	const [theme, setTheme] = useState<string>(() => {
		if (typeof window !== "undefined") {
			return (
				localStorage.getItem("theme") ||
				document.documentElement.getAttribute("data-bs-theme") ||
				"dark"
			);
		}
		return "dark";
	});

	useEffect(() => {
		const handleThemeChange = () => {
			const currentTheme =
				localStorage.getItem("theme") ||
				document.documentElement.getAttribute("data-bs-theme") ||
				"dark";
			setTheme(currentTheme);
		};

		// Listen for theme changes
		window.addEventListener("themechange", handleThemeChange);
		window.addEventListener("storage", handleThemeChange);

		// Initial check
		handleThemeChange();

		return () => {
			window.removeEventListener("themechange", handleThemeChange);
			window.removeEventListener("storage", handleThemeChange);
		};
	}, []);

	// Trans pride colors for connection status - adapts to theme
	const getStatusColor = (status: string) => {
		switch (status) {
			case "connected":
				return theme === "dark" ? "#7dd3fc" : "#55CDFC"; // Trans pride blue (lighter in dark mode)
			case "disconnected":
				return "#F7A8B8"; // Trans pride pink (works in both themes)
			case "checking":
				return theme === "dark" ? "#7dd3fc" : "#55CDFC"; // Trans pride blue (checking state)
			default:
				return "#9ca3af"; // muted gray fallback
		}
	};

	const getStatusDot = (status: string) => (
		<span
			style={{
				display: "inline-block",
				width: 10,
				height: 10,
				borderRadius: "50%",
				backgroundColor: getStatusColor(status),
				marginRight: 8,
				boxShadow: `0 0 4px ${getStatusColor(status)}`,
			}}
		/>
	);

	const currentYear = new Date().getFullYear();

	return (
		<footer
			className="mt-auto py-4"
			style={{
				borderTop: "1px solid var(--bs-border-color)",
				backgroundColor: "var(--bs-body-bg)",
				color: "var(--bs-body-color)",
			}}
		>
			<Container>
				<Row className="g-4">
					{/* Business Info */}
					<Col xs={12} md={4}>
						<h5 className="mb-3">
							<strong>Bob's Garage</strong>
						</h5>
						<div className="d-flex align-items-start mb-2">
							<MdLocationOn size={20} className="text-primary me-2 flex-shrink-0 mt-1" />
							<div>
								<div>123 Main Street</div>
								<div>Your City, NSW 12345</div>
							</div>
						</div>
						<div className="d-flex align-items-center mb-2">
							<MdLocalPhone size={20} className="text-primary me-2 flex-shrink-0" />
							<span>(02) 1234 5678</span>
						</div>
						<div className="d-flex align-items-center mb-2">
							<MdEmail size={20} className="text-primary me-2 flex-shrink-0" />
							<a href="mailto:info@bobsgarage.com.au" className="text-decoration-none">
								info@bobsgarage.com.au
							</a>
						</div>
						<div className="d-flex align-items-start">
							<MdSchedule size={20} className="text-primary me-2 flex-shrink-0 mt-1" />
							<div className="small">
								<div>Mon-Fri: 8AM-6PM</div>
								<div>Sat: 9AM-4PM</div>
								<div>Sun: Closed</div>
							</div>
						</div>
					</Col>

					{/* Quick Links */}
					<Col xs={12} md={4}>
						<h5 className="mb-3">Quick Links</h5>
						<div className="d-flex flex-column gap-2">
							<Link to="/" className="text-decoration-none">
								Home
							</Link>
							<Link to="/about" className="text-decoration-none">
								About Us
							</Link>
							<Link to="/services" className="text-decoration-none">
								Services
							</Link>
							<Link to="/staff" className="text-decoration-none">
								Our Team
							</Link>
						</div>
					</Col>

					{/* Social & Status */}
					<Col xs={12} md={4}>
						<h5 className="mb-3">Connect With Us</h5>
						<div className="d-flex gap-3 mb-4">
							<a
								href="https://facebook.com"
								target="_blank"
								rel="noreferrer"
								className="text-decoration-none d-flex align-items-center"
								aria-label="Facebook"
							>
								<FaFacebook size={24} className="text-primary" />
							</a>
							<a
								href="https://instagram.com"
								target="_blank"
								rel="noreferrer"
								className="text-decoration-none d-flex align-items-center"
								aria-label="Instagram"
							>
								<FaInstagram size={24} className="text-primary" />
							</a>
							<a
								href="mailto:info@bobsgarage.com.au"
								className="text-decoration-none d-flex align-items-center"
								aria-label="Email"
							>
								<MdEmail size={24} className="text-primary" />
							</a>
						</div>

						{/* Connection Status */}
						<div className="small">
							<div className="mb-2">
								<strong>System Status:</strong>
							</div>
							<div className="d-flex align-items-center mb-1">
								{getStatusDot(api)}
								<span>
									<span className="visually-hidden">API connection status: </span>API:{" "}
									<strong>{api}</strong>
									{apiPing !== null && (
										<span className="text-muted" style={{ fontSize: "0.75rem" }}>
											{" "}
											({apiPing}ms)
										</span>
									)}
								</span>
							</div>
							<div className="d-flex align-items-center">
								{getStatusDot(db)}
								<span>
									<span className="visually-hidden">Database connection status: </span>DB:{" "}
									<strong>{db}</strong>
									{dbPing !== null && (
										<span className="text-muted" style={{ fontSize: "0.75rem" }}>
											{" "}
											({dbPing}ms)
										</span>
									)}
								</span>
							</div>
						</div>
					</Col>
				</Row>

				{/* Copyright & Legal */}
				<Row className="mt-4 pt-3 border-top">
					<Col xs={12} md={6} className="text-center text-md-start text-muted small mb-2 mb-md-0">
						<div>© {currentYear} Bob's Garage. All rights reserved.</div>
						<div className="mt-1">Built with pride in our community.</div>
					</Col>
					<Col xs={12} md={6} className="text-center text-md-end">
						<div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-3 small">
							<Link to="/privacy-policy" className="text-decoration-none text-muted">
								Privacy Policy
							</Link>
							<span className="text-muted">·</span>
							<Link to="/terms-of-service" className="text-decoration-none text-muted">
								Terms of Service
							</Link>
							<span className="text-muted">·</span>
							<Link to="/accessibility" className="text-decoration-none text-muted">
								Accessibility
							</Link>
						</div>
					</Col>
				</Row>
			</Container>
		</footer>
	);
}
