/**
 * @file MetricsPanel.tsx
 * @author Bob's Garage Team
 * @description Prometheus metrics panel component for admin dashboard
 * @version 1.0.0
 * @since 1.0.0
 */

import { Card, Col, ProgressBar, Row } from "react-bootstrap";
import { useMetrics } from "../../hooks/useMetrics";

function formatNumber(num: number): string {
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
	if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
	return num.toString();
}

function formatPercentage(num: number): string {
	return `${(num * 100).toFixed(1)}%`;
}

function formatDuration(seconds: number): string {
	if (seconds < 0.001) return `${(seconds * 1000).toFixed(2)}ms`;
	if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
	return `${seconds.toFixed(3)}s`;
}

function getVariantForErrorRate(rate: number): "success" | "warning" | "danger" {
	if (rate < 0.01) return "success";
	if (rate < 0.05) return "warning";
	return "danger";
}

function getVariantForHitRate(rate: number): "success" | "warning" | "danger" {
	if (rate > 0.7) return "success";
	if (rate > 0.5) return "warning";
	return "danger";
}

function getVariantForDuration(seconds: number): "success" | "warning" | "danger" {
	if (seconds > 1) return "danger";
	if (seconds > 0.5) return "warning";
	return "success";
}

export default function MetricsPanel() {
	const { data: metrics, isLoading, error } = useMetrics();

	if (isLoading) {
		return (
			<Card className="shadow-sm">
				<Card.Header>
					<Card.Title className="mb-0">System Metrics</Card.Title>
				</Card.Header>
				<Card.Body>
					<div className="text-muted">Loading metrics...</div>
				</Card.Body>
			</Card>
		);
	}

	if (error || !metrics) {
		return (
			<Card className="shadow-sm">
				<Card.Header>
					<Card.Title className="mb-0">System Metrics</Card.Title>
				</Card.Header>
				<Card.Body>
					<div className="text-muted">Metrics unavailable</div>
				</Card.Body>
			</Card>
		);
	}

	const errorRate =
		metrics.httpRequests.total > 0 ? metrics.httpErrors / metrics.httpRequests.total : 0;

	return (
		<Card className="shadow-sm">
			<Card.Header>
				<Card.Title className="mb-0">System Metrics</Card.Title>
			</Card.Header>
			<Card.Body>
				<Row className="g-4">
					{/* HTTP Requests */}
					<Col md={6}>
						<div className="mb-3">
							<strong className="d-block mb-2">HTTP Requests</strong>
							<div className="mb-2">
								<div className="d-flex justify-content-between">
									<span>Total Requests</span>
									<strong>{formatNumber(metrics.httpRequests.total)}</strong>
								</div>
							</div>
							<div className="mb-2">
								<div className="d-flex justify-content-between">
									<span>Errors</span>
									<strong className="text-danger">{formatNumber(metrics.httpErrors)}</strong>
								</div>
							</div>
							<div className="mb-2">
								<div className="d-flex justify-content-between mb-1">
									<span>Error Rate</span>
									<span>{formatPercentage(errorRate)}</span>
								</div>
								<ProgressBar
									variant={getVariantForErrorRate(errorRate)}
									now={errorRate * 100}
									max={10}
									className="mb-1"
								/>
							</div>
						</div>
					</Col>

					{/* Cache Performance */}
					<Col md={6}>
						<div className="mb-3">
							<strong className="d-block mb-2">Cache Performance</strong>
							<div className="mb-2">
								<div className="d-flex justify-content-between">
									<span>Cache Hits</span>
									<strong className="text-success">{formatNumber(metrics.cache.hits)}</strong>
								</div>
							</div>
							<div className="mb-2">
								<div className="d-flex justify-content-between">
									<span>Cache Misses</span>
									<strong className="text-warning">{formatNumber(metrics.cache.misses)}</strong>
								</div>
							</div>
							<div className="mb-2">
								<div className="d-flex justify-content-between mb-1">
									<span>Hit Rate</span>
									<span>{formatPercentage(metrics.cache.hitRate)}</span>
								</div>
								<ProgressBar
									variant={getVariantForHitRate(metrics.cache.hitRate)}
									now={metrics.cache.hitRate * 100}
									className="mb-1"
								/>
							</div>
						</div>
					</Col>

					{/* HTTP Response Times */}
					{metrics.httpRequestDuration.average > 0 && (
						<Col md={6}>
							<div className="mb-3">
								<strong className="d-block mb-2">Response Times</strong>
								<div className="mb-2">
									<div className="d-flex justify-content-between">
										<span>Average</span>
										<strong>{formatDuration(metrics.httpRequestDuration.average)}</strong>
									</div>
								</div>
							</div>
						</Col>
					)}

					{/* Database Metrics */}
					{metrics.database.totalQueries > 0 && (
						<Col md={6}>
							<div className="mb-3">
								<strong className="d-block mb-2">Database Queries</strong>
								<div className="mb-2">
									<div className="d-flex justify-content-between">
										<span>Total Queries</span>
										<strong>{formatNumber(metrics.database.totalQueries)}</strong>
									</div>
								</div>
								{metrics.database.averageDuration > 0 && (
									<div className="mb-2">
										<div className="d-flex justify-content-between">
											<span>Avg Duration</span>
											<strong className={`text-${getVariantForDuration(metrics.database.averageDuration)}`}>
												{formatDuration(metrics.database.averageDuration)}
											</strong>
										</div>
									</div>
								)}
								{metrics.database.slowQueryCount > 0 && (
									<div className="mb-2">
										<div className="d-flex justify-content-between">
											<span>Slow Queries (&gt;1s)</span>
											<strong className="text-danger">{formatNumber(metrics.database.slowQueryCount)}</strong>
										</div>
									</div>
								)}
								{Object.keys(metrics.database.byOperation).length > 0 && (
									<div className="mb-2">
										<small className="text-muted d-block mb-1">By Operation:</small>
										<div className="d-flex flex-wrap gap-1">
											{Object.entries(metrics.database.byOperation)
												.sort(([, a], [, b]) => b - a)
												.slice(0, 3)
												.map(([op, count]) => (
													<span key={op} className="badge bg-secondary">
														{op}: {formatNumber(count)}
													</span>
												))}
										</div>
									</div>
								)}
							</div>
						</Col>
					)}

					{/* HTTP Methods */}
					{Object.keys(metrics.httpRequests.byMethod).length > 0 && (
						<Col xs={12}>
							<strong className="d-block mb-2">HTTP Methods</strong>
							<Row className="g-2">
								{Object.entries(metrics.httpRequests.byMethod)
									.sort(([, a], [, b]) => b - a)
									.map(([method, count]) => (
										<Col xs={6} sm={4} md={2} key={method}>
											<div className="text-center p-2 border rounded">
												<div className="h6 mb-0">{method}</div>
												<small className="text-muted">{formatNumber(count)}</small>
											</div>
										</Col>
									))}
							</Row>
						</Col>
					)}

					{/* Status Codes */}
					{Object.keys(metrics.httpRequests.byStatus).length > 0 && (
						<Col xs={12}>
							<strong className="d-block mb-2">Response Status Codes</strong>
							<Row className="g-2">
								{Object.entries(metrics.httpRequests.byStatus)
									.sort(([a], [b]) => Number(b) - Number(a))
									.slice(0, 5)
									.map(([status, count]) => (
										<Col xs={6} sm={4} md={2} key={status}>
											<div className="text-center p-2 border rounded">
												<div className="h6 mb-0">{status}</div>
												<small className="text-muted">{formatNumber(count)}</small>
											</div>
										</Col>
									))}
							</Row>
						</Col>
					)}
				</Row>
			</Card.Body>
		</Card>
	);
}
