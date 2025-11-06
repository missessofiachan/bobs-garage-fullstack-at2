/**
 * @file SystemHealthPanel.tsx
 * @author Bob's Garage Team
 * @description System health panel component for admin dashboard
 * @version 1.0.0
 * @since 1.0.0
 */

import { Card, Col, ProgressBar, Row } from "react-bootstrap";
import { useSystemHealth } from "../../hooks/useSystemHealth";

function formatUptime(seconds: number): string {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function SystemHealthPanel() {
	const { data: health, isLoading, error } = useSystemHealth();

	if (isLoading) {
		return (
			<Card className="shadow-sm">
				<Card.Header>
					<Card.Title className="mb-0">System Health</Card.Title>
				</Card.Header>
				<Card.Body>
					<div className="text-muted">Loading system health...</div>
				</Card.Body>
			</Card>
		);
	}

	if (error || !health) {
		return (
			<Card className="shadow-sm">
				<Card.Header>
					<Card.Title className="mb-0">System Health</Card.Title>
				</Card.Header>
				<Card.Body>
					<div className="text-danger">Unable to load system health</div>
				</Card.Body>
			</Card>
		);
	}

	const statusColor =
		health.status === "healthy" ? "success" : health.status === "degraded" ? "warning" : "danger";

	return (
		<Card className="shadow-sm">
			<Card.Header>
				<Card.Title className="mb-0">
					System Health{" "}
					<span className={`badge bg-${statusColor} ms-2`}>{health.status.toUpperCase()}</span>
				</Card.Title>
			</Card.Header>
			<Card.Body>
				<Row className="g-3">
					{/* Database Status */}
					<Col md={6}>
						<div className="mb-3">
							<div className="d-flex justify-content-between mb-1">
								<strong>Database</strong>
								<span
									className={
										health.services.database.status === "connected" ? "text-success" : "text-danger"
									}
								>
									{health.services.database.status === "connected" ? "✓ Connected" : "✗ Disconnected"}
								</span>
							</div>
							{health.services.database.responseTime !== undefined && (
								<small className="text-muted">
									Response time: {health.services.database.responseTime}ms
								</small>
							)}
						</div>
					</Col>

					{/* Cache Status */}
					<Col md={6}>
						<div className="mb-3">
							<div className="d-flex justify-content-between mb-1">
								<strong>Cache</strong>
								<span
									className={
										health.services.cache.status === "connected" || health.services.cache.status === "enabled"
											? "text-success"
											: health.services.cache.status === "disabled"
												? "text-muted"
												: "text-danger"
									}
								>
									{health.services.cache.status === "connected"
										? "✓ Connected"
										: health.services.cache.status === "enabled"
											? "✓ Enabled"
											: health.services.cache.status === "disabled"
												? "○ Disabled"
												: "✗ Disconnected"}
								</span>
							</div>
							{health.services.cache.type && (
								<small className="text-muted">Type: {health.services.cache.type}</small>
							)}
							{health.services.cache.responseTime !== undefined && (
								<small className="text-muted d-block">
									Response time: {health.services.cache.responseTime}ms
								</small>
							)}
						</div>
					</Col>

					{/* Memory Usage */}
					<Col xs={12}>
						<div className="mb-2">
							<div className="d-flex justify-content-between mb-1">
								<strong>Memory Usage</strong>
								<span>{health.system.memory.percentage}%</span>
							</div>
							<ProgressBar
								variant={
									health.system.memory.percentage < 70
										? "success"
										: health.system.memory.percentage < 85
											? "warning"
											: "danger"
								}
								now={health.system.memory.percentage}
								className="mb-1"
							/>
							<small className="text-muted">
								{formatBytes(health.system.memory.used)} / {formatBytes(health.system.memory.total)}
							</small>
						</div>
					</Col>

					{/* System Info */}
					<Col xs={12}>
						<Row className="g-3">
							<Col xs={6}>
								<div>
									<strong>Uptime</strong>
									<br />
									<small className="text-muted">{formatUptime(health.uptime)}</small>
								</div>
							</Col>
							<Col xs={6}>
								<div>
									<strong>Version</strong>
									<br />
									<small className="text-muted">{health.version}</small>
								</div>
							</Col>
						</Row>
					</Col>
				</Row>
			</Card.Body>
		</Card>
	);
}
