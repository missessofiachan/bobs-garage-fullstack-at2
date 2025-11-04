/**
 * @file Footer.tsx
 * @author Bob's Garage Team
 * @description Footer component displaying contact information, social media links, and real-time
 *              connection status indicators for API and database connectivity.
 * @version 1.0.0
 * @since 1.0.0
 */

import { container, vars } from "../styles/theme.css.ts";
import { useConnectionStatus } from "../hooks/useConnectionStatus";

export default function Footer() {
	const { api, db, apiPing, dbPing } = useConnectionStatus(5000);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "connected":
				return "#28a745"; // green
			case "disconnected":
				return "#dc3545"; // red
			case "checking":
				return "#ffc107"; // yellow
			default:
				return vars.color.muted;
		}
	};

	const getStatusDot = (status: string) => (
		<span
			style={{
				display: "inline-block",
				width: 8,
				height: 8,
				borderRadius: "50%",
				backgroundColor: getStatusColor(status),
				marginRight: 6,
			}}
		/>
	);

	return (
		<footer
			className={container}
			style={{
				borderTop: `1px solid ${vars.color.border}`,
				color: vars.color.muted,
				paddingTop: vars.space.sm,
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					gap: 12,
					flexWrap: "wrap",
				}}
			>
				<div>
					<strong>Bob's Garage</strong>
					<div>123 Mechanic St, Motortown</div>
					<div>Phone: (555) 123-4567</div>
				</div>
				<div>
					<a href="https://facebook.com" target="_blank" rel="noreferrer">
						Facebook
					</a>
					{" · "}
					<a href="https://instagram.com" target="_blank" rel="noreferrer">
						Instagram
					</a>
					{" · "}
					<a href="mailto:hello@bobsgarage.example">Email</a>
				</div>
				<div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: 4 }}>
					<div>
						{getStatusDot(api)}
						API: {api}
						{apiPing !== null && ` (${apiPing}ms)`}
					</div>
					<div>
						{getStatusDot(db)}
						DB: {db}
						{dbPing !== null && ` (${dbPing}ms)`}
					</div>
				</div>
			</div>
		</footer>
	);
}
