/**
 * @author Bob's Garage Team
 * @purpose Admin Dashboard page component displaying metrics and quick actions
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import ErrorDisplay from "../../components/admin/ErrorDisplay";
import MetricsPanel from "../../components/admin/MetricsPanel";
import SystemHealthPanel from "../../components/admin/SystemHealthPanel";
import Loading from "../../components/ui/Loading";
import usePageTitle from "../../hooks/usePageTitle";

interface Metrics {
	users: {
		total: number;
		active: number;
		inactive: number;
		admins: number;
		recent: number;
	};
	services: {
		total: number;
		published: number;
		unpublished: number;
		recent: number;
	};
	staff: {
		total: number;
		active: number;
		inactive: number;
		recent: number;
	};
	favorites: {
		total: number;
	};
	recentActivity: {
		usersToday: number;
		servicesToday: number;
		staffToday: number;
	};
}

export default function Dashboard() {
	usePageTitle("Admin Dashboard");

	const {
		data: metrics,
		isLoading,
		error,
	} = useQuery<Metrics>({
		queryKey: ["admin", "metrics"],
		queryFn: async () => {
			const { data } = await api.get<Metrics>("/admin/metrics");
			return data;
		},
		staleTime: 30_000, // Cache for 30 seconds
	});

	if (isLoading) return <Loading message="Loading dashboard…" />;

	return (
		<div>
			<h2>Admin Dashboard</h2>
			<p className="text-muted mb-4">Overview of your Bob's Garage administration panel</p>

			{error && (
				<div className="mb-4">
					<ErrorDisplay error={error} title="Failed to load dashboard data" />
				</div>
			)}

			{/* Statistics Cards */}
			<Row className="g-4 mb-4">
				<Col md={4}>
					<Card className="h-100 shadow-sm">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-start">
								<div className="flex-grow-1">
									<Card.Title className="text-muted small text-uppercase mb-2">
										Total Users
									</Card.Title>
									<h3 className="mb-1">{metrics?.users.total ?? 0}</h3>
									<div className="small text-muted">
										<span className="text-success">{metrics?.users.active ?? 0} active</span>
										{" • "}
										<span className="text-danger">{metrics?.users.inactive ?? 0} inactive</span>
										<br />
										<span className="text-primary">{metrics?.users.admins ?? 0} admins</span>
										{metrics?.users.recent ? (
											<>
												{" • "}
												<span className="text-info">{metrics.users.recent} new (7d)</span>
											</>
										) : null}
									</div>
								</div>
								<div className="fs-1 text-primary opacity-25">👥</div>
							</div>
						</Card.Body>
						<Card.Footer className="bg-transparent border-top-0 pt-0">
							<Link to="/admin/users" className="btn btn-sm btn-outline-primary">
								Manage Users →
							</Link>
						</Card.Footer>
					</Card>
				</Col>
				<Col md={4}>
					<Card className="h-100 shadow-sm">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-start">
								<div className="flex-grow-1">
									<Card.Title className="text-muted small text-uppercase mb-2">
										Total Services
									</Card.Title>
									<h3 className="mb-1">{metrics?.services.total ?? 0}</h3>
									<div className="small text-muted">
										<span className="text-success">
											{metrics?.services.published ?? 0} published
										</span>
										{" • "}
										<span className="text-warning">
											{metrics?.services.unpublished ?? 0} unpublished
										</span>
										{metrics?.services.recent ? (
											<>
												<br />
												<span className="text-info">{metrics.services.recent} new (7d)</span>
											</>
										) : null}
									</div>
								</div>
								<div className="fs-1 text-success opacity-25">🔧</div>
							</div>
						</Card.Body>
						<Card.Footer className="bg-transparent border-top-0 pt-0">
							<Link to="/admin/services" className="btn btn-sm btn-outline-success">
								Manage Services →
							</Link>
						</Card.Footer>
					</Card>
				</Col>
				<Col md={4}>
					<Card className="h-100 shadow-sm">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-start">
								<div className="flex-grow-1">
									<Card.Title className="text-muted small text-uppercase mb-2">
										Total Staff
									</Card.Title>
									<h3 className="mb-1">{metrics?.staff.total ?? 0}</h3>
									<div className="small text-muted">
										<span className="text-success">{metrics?.staff.active ?? 0} active</span>
										{" • "}
										<span className="text-danger">{metrics?.staff.inactive ?? 0} inactive</span>
										{metrics?.staff.recent ? (
											<>
												<br />
												<span className="text-info">{metrics.staff.recent} new (7d)</span>
											</>
										) : null}
									</div>
								</div>
								<div className="fs-1 text-info opacity-25">👔</div>
							</div>
						</Card.Body>
						<Card.Footer className="bg-transparent border-top-0 pt-0">
							<Link to="/admin/staff" className="btn btn-sm btn-outline-info">
								Manage Staff →
							</Link>
						</Card.Footer>
					</Card>
				</Col>
			</Row>

			{/* Additional Metrics */}
			<Row className="g-4 mb-4">
				<Col md={6}>
					<Card className="h-100 shadow-sm">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-start">
								<div className="flex-grow-1">
									<Card.Title className="text-muted small text-uppercase mb-2">
										Total Favorites
									</Card.Title>
									<h3 className="mb-0">{metrics?.favorites.total ?? 0}</h3>
									<small className="text-muted">User service favorites</small>
								</div>
								<div className="fs-1 text-warning opacity-25">⭐</div>
							</div>
						</Card.Body>
					</Card>
				</Col>
				<Col md={6}>
					<Card className="h-100 shadow-sm">
						<Card.Body>
							<Card.Title className="text-muted small text-uppercase mb-3">
								Activity Today
							</Card.Title>
							<Row className="g-3">
								<Col xs={4}>
									<div className="text-center">
										<div className="h4 mb-1 text-primary">
											{metrics?.recentActivity.usersToday ?? 0}
										</div>
										<small className="text-muted d-block">Users</small>
									</div>
								</Col>
								<Col xs={4}>
									<div className="text-center">
										<div className="h4 mb-1 text-success">
											{metrics?.recentActivity.servicesToday ?? 0}
										</div>
										<small className="text-muted d-block">Services</small>
									</div>
								</Col>
								<Col xs={4}>
									<div className="text-center">
										<div className="h4 mb-1 text-info">
											{metrics?.recentActivity.staffToday ?? 0}
										</div>
										<small className="text-muted d-block">Staff</small>
									</div>
								</Col>
							</Row>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* System Health & Metrics */}
			<Row className="g-4 mb-4">
				<Col lg={6}>
					<SystemHealthPanel />
				</Col>
				<Col lg={6}>
					<MetricsPanel />
				</Col>
			</Row>

			{/* Quick Actions */}
			<Card className="shadow-sm">
				<Card.Header>
					<Card.Title className="mb-0">Quick Actions</Card.Title>
				</Card.Header>
				<Card.Body>
					<Row className="g-3">
						<Col md={6} lg={3}>
							<Link to="/admin/services" className="text-decoration-none">
								<Card className="h-100 text-center border-primary">
									<Card.Body>
										<div className="fs-2 mb-2">🔧</div>
										<Card.Title className="h6">Services</Card.Title>
										<small className="text-muted">Manage service listings and images</small>
									</Card.Body>
								</Card>
							</Link>
						</Col>
						<Col md={6} lg={3}>
							<Link to="/admin/staff" className="text-decoration-none">
								<Card className="h-100 text-center border-info">
									<Card.Body>
										<div className="fs-2 mb-2">👔</div>
										<Card.Title className="h6">Staff</Card.Title>
										<small className="text-muted">Manage team members and photos</small>
									</Card.Body>
								</Card>
							</Link>
						</Col>
						<Col md={6} lg={3}>
							<Link to="/admin/users" className="text-decoration-none">
								<Card className="h-100 text-center border-warning">
									<Card.Body>
										<div className="fs-2 mb-2">👥</div>
										<Card.Title className="h6">Users</Card.Title>
										<small className="text-muted">Manage user accounts and permissions</small>
									</Card.Body>
								</Card>
							</Link>
						</Col>
						<Col md={6} lg={3}>
							<Link to="/" className="text-decoration-none">
								<Card className="h-100 text-center border-secondary">
									<Card.Body>
										<div className="fs-2 mb-2">🏠</div>
										<Card.Title className="h6">View Site</Card.Title>
										<small className="text-muted">Go back to the main website</small>
									</Card.Body>
								</Card>
							</Link>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</div>
	);
}
