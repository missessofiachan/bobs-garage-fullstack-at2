/**
 * @file AuditLogs.tsx
 * @author Bob's Garage Team
 * @description Admin page for viewing audit logs with filtering and timeline
 * @version 1.0.0
 * @since 1.0.0
 */

import React, { useState } from "react";
import { Badge, Button, Card, Col, Form, Pagination, Row, Table } from "react-bootstrap";
import { MdHistory, MdFilterList, MdClear } from "react-icons/md";
import ErrorDisplay from "../../components/admin/ErrorDisplay";
import Loading from "../../components/ui/Loading";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuditLogs, type AuditLog } from "../../hooks/useAuditLogs";

const ACTION_COLORS: Record<string, string> = {
	create: "success",
	update: "primary",
	delete: "danger",
	upload: "info",
	view: "secondary",
	login: "warning",
	logout: "warning",
};

const RESOURCE_ICONS: Record<string, string> = {
	service: "🔧",
	staff: "👔",
	user: "👥",
	favorite: "⭐",
	system: "⚙️",
	other: "📄",
};

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString();
}

function getActionColor(action: string): string {
	return ACTION_COLORS[action.toLowerCase()] || "secondary";
}

function getResourceIcon(resource: string): string {
	return RESOURCE_ICONS[resource.toLowerCase()] || RESOURCE_ICONS.other;
}

function StateDiff({ previous, current }: { previous: unknown; current: unknown }): React.ReactNode {
	if (!previous && !current) return <span className="text-muted">No state changes</span>;
	if (!previous) return <span className="text-success">Created</span>;
	if (!current) return <span className="text-danger">Deleted</span>;

	// Simple diff display
	const prev = typeof previous === "object" ? JSON.stringify(previous, null, 2) : String(previous);
	const curr = typeof current === "object" ? JSON.stringify(current, null, 2) : String(current);

	if (prev === curr) return <span className="text-muted">No changes</span>;

	return (
		<div className="small">
			<div className="text-danger">Previous: {prev.substring(0, 100)}...</div>
			<div className="text-success mt-1">Current: {curr.substring(0, 100)}...</div>
		</div>
	);
}

export default function AuditLogs() {
	usePageTitle("Audit Logs");

	const [filters, setFilters] = useState({
		action: "",
		resource: "",
		userId: "",
		startDate: "",
		endDate: "",
		page: 1,
		limit: 50,
	});

	const { data, isLoading, error } = useAuditLogs({
		page: filters.page,
		limit: filters.limit,
		action: filters.action || undefined,
		resource: filters.resource || undefined,
		userId: filters.userId ? Number(filters.userId) : undefined,
		startDate: filters.startDate || undefined,
		endDate: filters.endDate || undefined,
	});

	const handleFilterChange = (key: string, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
	};

	const clearFilters = () => {
		setFilters({
			action: "",
			resource: "",
			userId: "",
			startDate: "",
			endDate: "",
			page: 1,
			limit: 50,
		});
	};

	const hasActiveFilters = filters.action || filters.resource || filters.userId || filters.startDate || filters.endDate;

	if (isLoading) return <Loading message="Loading audit logs…" />;

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h2>
						<MdHistory className="me-2" />
						Audit Logs
					</h2>
					<p className="text-muted mb-0">Track all admin actions and changes</p>
				</div>
			</div>

			{error && (
				<div className="mb-4">
					<ErrorDisplay error={error} title="Failed to load audit logs" />
				</div>
			)}

			{/* Filters */}
			<Card className="mb-4 shadow-sm">
				<Card.Header>
					<div className="d-flex justify-content-between align-items-center">
						<Card.Title className="mb-0">
							<MdFilterList className="me-2" />
							Filters
						</Card.Title>
						{hasActiveFilters && (
							<Button variant="outline-secondary" size="sm" onClick={clearFilters}>
								<MdClear className="me-1" />
								Clear Filters
							</Button>
						)}
					</div>
				</Card.Header>
				<Card.Body>
					<Row className="g-3">
						<Col md={3}>
							<Form.Label className="small">Action</Form.Label>
							<Form.Select
								value={filters.action}
								onChange={(e) => handleFilterChange("action", e.target.value)}
							>
								<option value="">All Actions</option>
								<option value="create">Create</option>
								<option value="update">Update</option>
								<option value="delete">Delete</option>
								<option value="upload">Upload</option>
								<option value="view">View</option>
								<option value="login">Login</option>
								<option value="logout">Logout</option>
							</Form.Select>
						</Col>
						<Col md={3}>
							<Form.Label className="small">Resource</Form.Label>
							<Form.Select
								value={filters.resource}
								onChange={(e) => handleFilterChange("resource", e.target.value)}
							>
								<option value="">All Resources</option>
								<option value="service">Service</option>
								<option value="staff">Staff</option>
								<option value="user">User</option>
								<option value="favorite">Favorite</option>
								<option value="system">System</option>
							</Form.Select>
						</Col>
						<Col md={2}>
							<Form.Label className="small">User ID</Form.Label>
							<Form.Control
								type="number"
								placeholder="User ID"
								value={filters.userId}
								onChange={(e) => handleFilterChange("userId", e.target.value)}
							/>
						</Col>
						<Col md={2}>
							<Form.Label className="small">Start Date</Form.Label>
							<Form.Control
								type="date"
								value={filters.startDate}
								onChange={(e) => handleFilterChange("startDate", e.target.value)}
							/>
						</Col>
						<Col md={2}>
							<Form.Label className="small">End Date</Form.Label>
							<Form.Control
								type="date"
								value={filters.endDate}
								onChange={(e) => handleFilterChange("endDate", e.target.value)}
							/>
						</Col>
					</Row>
				</Card.Body>
			</Card>

			{/* Audit Logs Table */}
			<Card className="shadow-sm">
				<Card.Header>
					<Card.Title className="mb-0">
						Activity Log ({data?.pagination.total ?? 0} total)
					</Card.Title>
				</Card.Header>
				<Card.Body className="p-0">
					<div className="table-responsive">
						<Table hover striped className="mb-0">
							<thead>
								<tr>
									<th>Time</th>
									<th>User</th>
									<th>Action</th>
									<th>Resource</th>
									<th>Description</th>
									<th>IP Address</th>
								</tr>
							</thead>
							<tbody>
								{data?.data.length === 0 ? (
									<tr>
										<td colSpan={6} className="text-center text-muted py-4">
											No audit logs found
										</td>
									</tr>
								) : (
									data?.data.map((log: AuditLog) => (
										<tr key={log.id}>
											<td>
												<small className="text-muted">{formatDate(log.createdAt)}</small>
											</td>
											<td>
												{log.userEmail ? (
													<span>
														{log.userEmail}
														{log.userId && (
															<small className="text-muted d-block">ID: {log.userId}</small>
														)}
													</span>
												) : (
													<span className="text-muted">System</span>
												)}
											</td>
											<td>
												<Badge bg={getActionColor(log.action)}>{log.action.toUpperCase()}</Badge>
											</td>
											<td>
												<span>
													{getResourceIcon(log.resource)} {log.resource}
													{log.resourceId && (
														<small className="text-muted d-block">ID: {log.resourceId}</small>
													)}
												</span>
											</td>
											<td>
												<div>{log.description}</div>
												{(log.previousState !== null || log.newState !== null) && (
													<details className="mt-1">
														<summary className="small text-muted" style={{ cursor: "pointer" }}>View Changes</summary>
														<div className="mt-2 p-2 bg-light rounded">
															<StateDiff previous={log.previousState ?? null} current={log.newState ?? null} />
														</div>
													</details>
												)}
											</td>
											<td>
												<small className="text-muted">{log.ipAddress || "N/A"}</small>
												{log.requestId && (
													<small className="text-muted d-block">Req: {log.requestId.substring(0, 8)}...</small>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</Table>
					</div>
				</Card.Body>
				{data && data.pagination.pages > 1 && (
					<Card.Footer>
						<div className="d-flex justify-content-between align-items-center">
							<div className="text-muted small">
								Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
								{Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
								{data.pagination.total} entries
							</div>
							<Pagination className="mb-0">
								<Pagination.Prev
									disabled={data.pagination.page === 1}
									onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
								/>
								{Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
									const page = i + 1;
									return (
										<Pagination.Item
											key={page}
											active={page === data.pagination.page}
											onClick={() => setFilters((prev) => ({ ...prev, page }))}
										>
											{page}
										</Pagination.Item>
									);
								})}
								<Pagination.Next
									disabled={data.pagination.page === data.pagination.pages}
									onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
								/>
							</Pagination>
						</div>
					</Card.Footer>
				)}
			</Card>
		</div>
	);
}

