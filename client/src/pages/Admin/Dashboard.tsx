/**
 * @author Bob's Garage Team
 * @purpose Admin Dashboard page component displaying metrics and quick actions
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loading from "../../components/ui/Loading";
import usePageTitle from "../../hooks/usePageTitle";

interface Metrics {
	users: number;
	services: number;
	staff: number;
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
	if (error) return <div className="alert alert-danger">Failed to load dashboard data.</div>;

	return (
		<div>
			<h2>Admin Dashboard</h2>
			<p className="text-muted mb-4">Overview of your Bob's Garage administration panel</p>

			{/* Statistics Cards */}
			<Row className="g-4 mb-4">
				<Col md={4}>
					<Card className="h-100 shadow-sm">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-start">
								<div>
									<Card.Title className="text-muted small text-uppercase mb-2">
										Total Users
									</Card.Title>
									<h3 className="mb-0">{metrics?.users ?? 0}</h3>
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
								<div>
									<Card.Title className="text-muted small text-uppercase mb-2">
										Total Services
									</Card.Title>
									<h3 className="mb-0">{metrics?.services ?? 0}</h3>
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
								<div>
									<Card.Title className="text-muted small text-uppercase mb-2">
										Total Staff
									</Card.Title>
									<h3 className="mb-0">{metrics?.staff ?? 0}</h3>
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
