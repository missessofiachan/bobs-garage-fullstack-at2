/**
 * @author Bob's Garage Team
 * @purpose Service detail page showing full information about a specific service
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import { Alert, Button, Card, Col, Image, Row } from "react-bootstrap";
import { MdArrowBack, MdBuild, MdCheckCircle } from "react-icons/md";
import { Link, Navigate, useParams } from "react-router-dom";
import ErrorDisplay from "../components/admin/ErrorDisplay";
import FavouriteButton from "../components/FavouriteButton";
import Loading from "../components/ui/Loading";
import usePageTitle from "../hooks/usePageTitle";
import { useService } from "../hooks/useServices";
import { getImageBaseUrl } from "../utils/api";
import { fadeInUp } from "../utils/animations";
import { formatCurrency } from "../utils/formatters";
import { getImageSrc, IMAGE_PLACEHOLDER } from "../utils/imagePlaceholder";

export default function ServiceDetail() {
	const { id } = useParams<{ id: string }>();
	const serviceId = id ? Number.parseInt(id, 10) : undefined;
	const { data: service, isLoading, error } = useService(serviceId);

	usePageTitle(service ? `${service.name} - Services` : "Service Details");

	if (isLoading) return <Loading message="Loading service details…" />;

	if (error) {
		return (
			<div className="py-4">
				<ErrorDisplay error={error} title="Failed to load service" />
				<div className="mt-3">
					<Link to="/services" className="btn btn-outline-primary">
						<MdArrowBack className="me-2" />
						Back to Services
					</Link>
				</div>
			</div>
		);
	}

	if (!service) {
		return <Navigate to="/services" replace />;
	}

	if (!service.published) {
		return (
			<div className="py-4">
				<Alert variant="warning">This service is not currently available.</Alert>
				<div className="mt-3">
					<Link to="/services" className="btn btn-outline-primary">
						<MdArrowBack className="me-2" />
						Back to Services
					</Link>
				</div>
			</div>
		);
	}

	const imageSrc = getImageSrc(service.imageUrl, getImageBaseUrl());
	const isPlaceholder = !service.imageUrl || service.imageUrl.trim() === "";

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="py-4"
		>
			{/* Back Button */}
			<motion.div className="mb-4" {...fadeInUp}>
				<Link to="/services" className="btn btn-outline-primary">
					<MdArrowBack className="me-2" />
					Back to Services
				</Link>
			</motion.div>

			<Row>
				{/* Image Column */}
				<Col md={6} className="mb-4">
					<motion.div {...fadeInUp}>
						<Card className="shadow-sm">
							<div
								style={{
									position: "relative",
									width: "100%",
									height: "500px",
									overflow: "hidden",
									backgroundColor: isPlaceholder ? "#f3f4f6" : "transparent",
								}}
							>
								<Image
									src={imageSrc}
									alt={service.name}
									fluid
									style={{
										width: "100%",
										height: "100%",
										objectFit: isPlaceholder ? "contain" : "cover",
										padding: isPlaceholder ? "2rem" : "0",
									}}
									loading="lazy"
									onError={(e) => {
										if ((e.currentTarget as HTMLImageElement).src !== IMAGE_PLACEHOLDER) {
											(e.currentTarget as HTMLImageElement).src = IMAGE_PLACEHOLDER;
										}
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: 16,
										right: 16,
									}}
								>
									<FavouriteButton id={service.id} />
								</div>
							</div>
						</Card>
					</motion.div>
				</Col>

				{/* Details Column */}
				<Col md={6}>
					<motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
						<Card className="shadow-sm h-100">
							<Card.Body className="p-4">
								<div className="d-flex align-items-center gap-3 mb-3">
									<MdBuild size={40} className="text-primary" />
									<div className="flex-grow-1">
										<h1 className="mb-1">{service.name}</h1>
										{service.published && (
											<span className="badge bg-success">
												<MdCheckCircle className="me-1" />
												Available
											</span>
										)}
									</div>
								</div>

								<div className="mb-4">
									<div className="d-flex align-items-baseline gap-2 mb-3">
										<span className="text-muted fs-6">Price:</span>
										<span className="fw-bold text-primary fs-3">{formatCurrency(service.price)}</span>
									</div>

									{service.description && (
										<div className="mb-4">
											<h5 className="mb-3">Description</h5>
											<p className="text-muted" style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
												{service.description}
											</p>
										</div>
									)}
								</div>

								<div className="mt-auto">
									<Button
										as={Link as any}
										to={`/contact?service=${encodeURIComponent(service.name)}`}
										variant="primary"
										size="lg"
										className="w-100"
									>
										Contact Us About This Service
									</Button>
								</div>
							</Card.Body>
						</Card>
					</motion.div>
				</Col>
			</Row>
		</motion.div>
	);
}
