/**
 * @author Bob's Garage Team
 * @purpose Enhanced user profile page with account info, favorites, and settings
 * @version 2.0.0
 */

import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../api/axios";
import type { UserMeDTO } from "../api/types";
import Loading from "../components/ui/Loading";
import { useToast } from "../components/ui/ToastProvider";
import { useFavorites } from "../hooks/useFavorites";
import usePageTitle from "../hooks/usePageTitle";
import { formatErrorMessageWithId } from "../utils/errorFormatter";

export default function Profile() {
	const [me, setMe] = useState<UserMeDTO | null>(null);
	const [email, setEmail] = useState("");
	const [saving, setSaving] = useState(false);
	const { notify } = useToast();
	const { role } = useSelector((s: any) => s.auth);
	const { favorites, isLoading: loadingFavorites } = useFavorites();

	usePageTitle("My Profile");

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get<UserMeDTO>("/users/me");
				setMe(data);
				setEmail(data.email);
			} catch {
				notify({ body: "Failed to load profile", variant: "danger" });
			}
		})();
	}, [notify]);

	const onSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const { data } = await api.put<UserMeDTO>("/users/me", { email });
			setMe(data);
			notify({ title: "Success", body: "Profile updated successfully", variant: "success" });
		} catch (err: any) {
			const { message, requestId } = formatErrorMessageWithId(err);
			notify({ body: message, variant: "danger", requestId });
		} finally {
			setSaving(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (!me) return <Loading message="Loading profile…" />;

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h1>My Profile</h1>
				{role === "admin" && (
					<Link to="/admin/dashboard">
						<Button variant="primary">Admin Dashboard</Button>
					</Link>
				)}
			</div>

			<Row className="g-4">
				{/* Account Information */}
				<Col md={6}>
					<Card>
						<Card.Header>
							<h5 className="mb-0">Account Information</h5>
						</Card.Header>
						<Card.Body>
							<div className="mb-3">
								<strong>Email:</strong>
								<div className="text-muted">{me.email}</div>
							</div>
							<div className="mb-3">
								<strong>Role:</strong>
								<div>
									<Badge bg={role === "admin" ? "danger" : "secondary"}>{me.role}</Badge>
								</div>
							</div>
							<div className="mb-3">
								<strong>Account Status:</strong>
								<div>
									<Badge bg={me.active ? "success" : "warning"}>{me.active ? "Active" : "Inactive"}</Badge>
								</div>
							</div>
							<div>
								<strong>Member Since:</strong>
								<div className="text-muted">{formatDate(me.createdAt)}</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				{/* Edit Profile */}
				<Col md={6}>
					<Card>
						<Card.Header>
							<h5 className="mb-0">Edit Profile</h5>
						</Card.Header>
						<Card.Body>
							<Form onSubmit={onSave}>
								<Form.Group className="mb-3">
									<Form.Label>Email Address</Form.Label>
									<Form.Control
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										type="email"
										required
										placeholder="Enter your email"
									/>
									<Form.Text className="text-muted">
										We'll never share your email with anyone else.
									</Form.Text>
								</Form.Group>
								<Button type="submit" variant="primary" disabled={saving}>
									{saving ? "Saving…" : "Save Changes"}
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</Col>

				{/* Favorites Section */}
				<Col xs={12}>
					<Card>
						<Card.Header className="d-flex align-items-center justify-content-between">
							<h5 className="mb-0">
								My Favorites <Badge bg="primary">{favorites.length}</Badge>
							</h5>
							<Button as={Link as any} to="/favorites" variant="outline-primary" size="sm">
								View All Favorites
							</Button>
						</Card.Header>
						<Card.Body>
							{loadingFavorites ? (
								<div className="text-center py-3">
									<Loading message="Loading favorites…" />
								</div>
							) : favorites.length === 0 ? (
								<Alert variant="info">
									You haven't favorited any services yet. <Link to="/services">Browse services</Link> to add
									some!
								</Alert>
							) : (
								<Alert variant="info" className="mb-0">
									You have <strong>{favorites.length}</strong> favorited{" "}
									{favorites.length === 1 ? "service" : "services"}.{" "}
									<Link to="/favorites">View your favorites page</Link> to see them all!
								</Alert>
							)}
						</Card.Body>
					</Card>
				</Col>

				{/* Quick Links */}
				<Col xs={12}>
					<Card>
						<Card.Header>
							<h5 className="mb-0">Quick Links</h5>
						</Card.Header>
						<Card.Body>
							<div className="d-flex flex-wrap gap-2">
								<Link to="/services">
									<Button variant="outline-primary">Browse Services</Button>
								</Link>
								<Link to="/settings">
									<Button variant="outline-secondary">Settings</Button>
								</Link>
								{role === "admin" && (
									<Link to="/admin">
										<Button variant="outline-danger">Admin Panel</Button>
									</Link>
								)}
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
}
