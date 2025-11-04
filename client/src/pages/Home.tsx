/**
 * @author Bob's Garage Team
 * @purpose Home page with animated entrance and comprehensive sections
 * @version 3.0.0
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, Col, Row, Image } from "react-bootstrap";
import { useServices } from "../hooks/useServices";
import { useStaffList } from "../hooks/useStaff";
import { formatCurrency } from "../utils/formatters";
import { getImageBaseUrl } from "../utils/api";
import { getImageSrc } from "../utils/imagePlaceholder";
import { MdBuild, MdPeople, MdLocalPhone, MdEmail, MdSchedule, MdLocationOn, MdStar, MdCheckCircle } from "react-icons/md";
import Loading from "../components/ui/Loading";

const fadeInUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5 },
};

const staggerContainer = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.1,
		},
	},
};

export default function Home() {
	const { accessToken } = useSelector((s: any) => s.auth);
	const { data: services, isLoading: servicesLoading } = useServices();
	const { data: staff, isLoading: staffLoading } = useStaffList();

	const featuredServices = (services ?? [])
		.filter((s) => s.published !== false)
		.slice(0, 4);

	const featuredStaff = (staff ?? []).filter((m) => m.active !== false).slice(0, 3);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="py-4"
		>
			{/* Hero Section */}
			<motion.div
				className="p-4 p-md-5 mb-5 bg-body-secondary rounded-3"
				initial={{ scale: 0.95 }}
				animate={{ scale: 1 }}
				transition={{ delay: 0.2, duration: 0.4 }}
			>
				<div className="container-fluid py-5">
					<motion.h1
						className="display-5 fw-bold"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3, duration: 0.5 }}
					>
						Bob's Garage
					</motion.h1>
					<motion.p
						className="col-md-8 fs-5"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4, duration: 0.5 }}
					>
						Honest mechanics, quality service. Book your service and meet our friendly team.
					</motion.p>
					<motion.div
						className="d-flex flex-wrap gap-2"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.5 }}
					>
						<Link className="btn btn-primary btn-lg" to="/services">
							View Services
						</Link>
						<Link className="btn btn-outline-secondary btn-lg" to="/about">
							About Us
						</Link>
						{!accessToken && (
							<Link className="btn btn-outline-dark btn-lg" to="/login">
								Login
							</Link>
						)}
						{accessToken && (
							<Link className="btn btn-outline-success btn-lg" to="/profile">
								Profile
							</Link>
						)}
					</motion.div>
				</div>
			</motion.div>

			{/* Stats Section */}
			<motion.section
				className="mb-5"
				{...fadeInUp}
				transition={{ delay: 0.6 }}
				aria-label="Statistics"
			>
				<Row className="g-3">
					<Col xs={6} md={3}>
						<Card className="text-center h-100">
							<Card.Body>
								<div className="display-4 fw-bold text-primary" aria-label="15 plus years">15+</div>
								<div className="text-muted">Years Experience</div>
							</Card.Body>
						</Card>
					</Col>
					<Col xs={6} md={3}>
						<Card className="text-center h-100">
							<Card.Body>
								<div className="display-4 fw-bold text-primary" aria-label="5000 plus happy customers">5000+</div>
								<div className="text-muted">Happy Customers</div>
							</Card.Body>
						</Card>
					</Col>
					<Col xs={6} md={3}>
						<Card className="text-center h-100">
							<Card.Body>
								<div className="display-4 fw-bold text-primary" aria-label="1000 plus services completed">1000+</div>
								<div className="text-muted">Services Completed</div>
							</Card.Body>
						</Card>
					</Col>
					<Col xs={6} md={3}>
						<Card className="text-center h-100">
							<Card.Body>
								<div className="display-4 fw-bold text-primary" aria-label="24/7 support available">24/7</div>
								<div className="text-muted">Support Available</div>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</motion.section>

			{/* Why Choose Us Section */}
			<motion.section
				className="mb-5"
				{...fadeInUp}
				transition={{ delay: 0.7 }}
			>
				<h2 className="mb-4">Why Choose Us</h2>
				<Row className="g-3">
					<Col md={6} lg={3}>
						<Card className="h-100">
							<Card.Body>
								<MdCheckCircle size={32} className="text-primary mb-2" />
								<Card.Title>Expert Mechanics</Card.Title>
								<Card.Text>Certified professionals with years of experience</Card.Text>
							</Card.Body>
						</Card>
					</Col>
					<Col md={6} lg={3}>
						<Card className="h-100">
							<Card.Body>
								<MdCheckCircle size={32} className="text-primary mb-2" />
								<Card.Title>Fair Pricing</Card.Title>
								<Card.Text>Transparent, competitive rates with no hidden fees</Card.Text>
							</Card.Body>
						</Card>
					</Col>
					<Col md={6} lg={3}>
						<Card className="h-100">
							<Card.Body>
								<MdCheckCircle size={32} className="text-primary mb-2" />
								<Card.Title>Quality Service</Card.Title>
								<Card.Text>We use only the best parts and materials</Card.Text>
							</Card.Body>
						</Card>
					</Col>
					<Col md={6} lg={3}>
						<Card className="h-100">
							<Card.Body>
								<MdCheckCircle size={32} className="text-primary mb-2" />
								<Card.Title>Customer First</Card.Title>
								<Card.Text>Your satisfaction is our top priority</Card.Text>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</motion.section>

			{/* Featured Services Section */}
			<motion.section
				className="mb-5"
				{...fadeInUp}
				transition={{ delay: 0.8 }}
			>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h2>Featured Services</h2>
					<Link to="/services" className="btn btn-outline-primary">
						View All <MdBuild className="ms-1" />
					</Link>
				</div>
				{servicesLoading ? (
					<Loading message="Loading services…" />
				) : featuredServices.length > 0 ? (
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
					>
						<Row className="g-3">
							{featuredServices.map((service, idx) => {
								const imageSrc = getImageSrc(service.imageUrl, getImageBaseUrl());
								return (
									<Col key={service.id} xs={12} sm={6} lg={3}>
										<motion.div
											variants={fadeInUp}
											whileHover={{ y: -5 }}
											transition={{ type: "spring", stiffness: 300 }}
										>
											<Card className="h-100">
												<Image
													src={imageSrc}
													alt={service.name}
													fluid
													style={{
														height: 200,
														objectFit: "cover",
														width: "100%",
													}}
													onError={(e) => {
														(e.currentTarget as HTMLImageElement).src = imageSrc;
													}}
												/>
												<Card.Body>
													<Card.Title>{service.name}</Card.Title>
													<Card.Text className="text-muted small">
														{service.description?.substring(0, 80)}
														{service.description && service.description.length > 80 ? "..." : ""}
													</Card.Text>
													<div className="fw-bold text-primary fs-5">
														{formatCurrency(service.price)}
													</div>
												</Card.Body>
											</Card>
										</motion.div>
									</Col>
								);
							})}
						</Row>
					</motion.div>
				) : (
					<p className="text-muted">No services available at the moment.</p>
				)}
			</motion.section>

			{/* Meet the Team Section */}
			<motion.section
				className="mb-5"
				{...fadeInUp}
				transition={{ delay: 0.9 }}
			>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h2>Meet the Team</h2>
					<Link to="/staff" className="btn btn-outline-primary">
						View All <MdPeople className="ms-1" />
					</Link>
				</div>
				{staffLoading ? (
					<Loading message="Loading staff…" />
				) : featuredStaff.length > 0 ? (
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
					>
						<Row className="g-3">
							{featuredStaff.map((member) => {
								const photoSrc = getImageSrc(member.photoUrl, getImageBaseUrl());
								return (
									<Col key={member.id} xs={12} sm={6} md={4}>
										<motion.div
											variants={fadeInUp}
											whileHover={{ y: -5 }}
											transition={{ type: "spring", stiffness: 300 }}
										>
											<Card className="h-100">
												<Image
													src={photoSrc}
													alt={`${member.name} photo`}
													fluid
													style={{
														height: 300,
														objectFit: "cover",
														width: "100%",
													}}
													onError={(e) => {
														(e.currentTarget as HTMLImageElement).src = photoSrc;
													}}
												/>
												<Card.Body>
													<Card.Title>{member.name}</Card.Title>
													{member.role && (
														<div className="text-muted mb-2">{member.role}</div>
													)}
													{member.bio && (
														<Card.Text className="small">
															{member.bio.substring(0, 100)}
															{member.bio.length > 100 ? "..." : ""}
														</Card.Text>
													)}
												</Card.Body>
											</Card>
										</motion.div>
									</Col>
								);
							})}
						</Row>
					</motion.div>
				) : (
					<p className="text-muted">No staff members available at the moment.</p>
				)}
			</motion.section>

			{/* Testimonials Section */}
			<motion.section
				className="mb-5"
				{...fadeInUp}
				transition={{ delay: 1.0 }}
			>
				<h2 className="mb-4">What Our Customers Say</h2>
				<Row className="g-3">
					<Col md={4}>
						<Card className="h-100">
							<Card.Body>
								<div className="mb-2">
									{[...Array(5)].map((_, i) => (
										<MdStar key={i} className="text-warning" size={20} />
									))}
								</div>
								<Card.Text>
									"Best garage in town! They fixed my car quickly and the price was fair. Highly
									recommend!"
								</Card.Text>
								<Card.Text className="text-muted small mb-0">
									<strong>Sarah Johnson</strong>
								</Card.Text>
							</Card.Body>
						</Card>
					</Col>
					<Col md={4}>
						<Card className="h-100">
							<Card.Body>
								<div className="mb-2">
									{[...Array(5)].map((_, i) => (
										<MdStar key={i} className="text-warning" size={20} />
									))}
								</div>
								<Card.Text>
									"Professional, honest, and reliable. They explained everything clearly and did a
									great job!"
								</Card.Text>
								<Card.Text className="text-muted small mb-0">
									<strong>Mike Chen</strong>
								</Card.Text>
							</Card.Body>
						</Card>
					</Col>
					<Col md={4}>
						<Card className="h-100">
							<Card.Body>
								<div className="mb-2">
									{[...Array(5)].map((_, i) => (
										<MdStar key={i} className="text-warning" size={20} />
									))}
								</div>
								<Card.Text>
									"Excellent service and friendly staff. My car runs like new again. Thank you!"
								</Card.Text>
								<Card.Text className="text-muted small mb-0">
									<strong>Emily Rodriguez</strong>
								</Card.Text>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</motion.section>

			{/* CTA & Contact Section */}
			<motion.section
				className="mb-5"
				{...fadeInUp}
				transition={{ delay: 1.1 }}
			>
				<Card className="bg-body-secondary">
					<Card.Body className="p-4 p-md-5">
						<Row>
							<Col md={6} className="mb-4 mb-md-0">
								<h2 className="mb-4">Ready to Get Started?</h2>
								<p className="fs-5 mb-4">
									Book your service today and experience the difference of working with honest,
									professional mechanics.
								</p>
								<Link to="/services" className="btn btn-primary btn-lg me-2">
									Book a Service
								</Link>
								<Link to="/about" className="btn btn-outline-secondary btn-lg">
									Learn More
								</Link>
							</Col>
							<Col md={6}>
								<h3 className="mb-3">Get in Touch</h3>
								<div className="d-flex align-items-center mb-2">
									<MdLocationOn size={20} className="text-primary me-2" />
									<span>123 Main Street, Your City, 12345</span>
								</div>
								<div className="d-flex align-items-center mb-2">
									<MdLocalPhone size={20} className="text-primary me-2" />
									<span>(02) 1234 5678</span>
								</div>
								<div className="d-flex align-items-center mb-2">
									<MdEmail size={20} className="text-primary me-2" />
									<span>info@bobsgarage.com.au</span>
								</div>
								<div className="d-flex align-items-center">
									<MdSchedule size={20} className="text-primary me-2" />
									<div>
										<div>Mon - Fri: 8:00 AM - 6:00 PM</div>
										<div>Sat: 9:00 AM - 4:00 PM</div>
										<div>Sun: Closed</div>
									</div>
								</div>
							</Col>
						</Row>
					</Card.Body>
				</Card>
			</motion.section>
		</motion.div>
	);
}
