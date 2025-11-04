/**
 * @author Bob's Garage Team
 * @purpose Dedicated page for displaying and managing user favorites
 * @version 1.0.0
 */

import { Button, Card, Row, Col, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import Loading from "../components/ui/Loading";
import usePageTitle from "../hooks/usePageTitle";
import { formatCurrency } from "../utils/formatters";
import { getImageBaseUrl } from "../utils/api";
import FavouriteButton from "../components/FavouriteButton";
import { MdFavorite } from "react-icons/md";

export default function Favorites() {
	const { favorites, isLoading } = useFavorites();
	usePageTitle("My Favorites");

	if (isLoading) {
		return <Loading message="Loading favorites…" />;
	}

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between mb-4">
				<div className="d-flex align-items-center gap-2">
					<MdFavorite size={32} className="text-primary" />
					<h1 className="mb-0">My Favorites</h1>
					<Badge bg="secondary" className="fs-6">{favorites.length}</Badge>
				</div>
			</div>

			{favorites.length === 0 ? (
				<Alert variant="info" className="text-center py-5">
					<MdFavorite size={48} className="text-muted mb-3" />
					<h4>No favorites yet</h4>
					<p className="mb-3">
						You haven't favorited any services yet. Start exploring to add services you
						love!
					</p>
					<Button as={Link} to="/services" variant="primary">
						Browse Services
					</Button>
				</Alert>
			) : (
				<Row className="g-4">
					{favorites.map((service) => {
						const imageSrc = service.imageUrl
							? service.imageUrl.startsWith("http")
								? service.imageUrl
								: `${getImageBaseUrl()}${service.imageUrl}`
							: undefined;

						return (
							<Col key={service.id} xs={12} sm={6} md={4} lg={3}>
								<Card className="h-100 shadow-sm">
									{imageSrc && (
										<Card.Img
											variant="top"
											src={imageSrc}
											style={{
												height: 200,
												objectFit: "cover",
											}}
											onError={(e) => {
												(e.currentTarget as HTMLImageElement).style.display =
													"none";
											}}
										/>
									)}
									<Card.Body className="d-flex flex-column">
										<Card.Title>{service.name}</Card.Title>
										<Card.Text className="flex-grow-1">
											<strong className="text-primary fs-5">
												{formatCurrency(service.price)}
											</strong>
											<br />
											<small className="text-muted">{service.description}</small>
										</Card.Text>
										<div className="d-flex gap-2 mt-auto">
											<Button
												as={Link}
												to="/services"
												size="sm"
												variant="outline-primary"
												className="flex-grow-1"
											>
												View Service
											</Button>
											<FavouriteButton id={service.id} />
										</div>
									</Card.Body>
								</Card>
							</Col>
						);
					})}
				</Row>
			)}
		</div>
	);
}
