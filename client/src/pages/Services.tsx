/**
 * @author Bob's Garage Team
 * @purpose Services page with grid/list view, filters, and animations
 * @version 2.0.0
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { Alert, Button, Card, Col, Form, Image, InputGroup, Row, Table } from "react-bootstrap";
import { MdBuild, MdSort, MdViewList, MdViewModule } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Autocomplete from "../components/ui/Autocomplete";
import FavouriteButton from "../components/FavouriteButton";
import Loading from "../components/ui/Loading";
import usePageTitle from "../hooks/usePageTitle";
import { useServiceFilters } from "../hooks/useServiceFilters";
import { useServices } from "../hooks/useServices";
import type { ServicesSort, ServicesView } from "../slices/preferences.slice";
import { setServicesSort, setServicesView } from "../slices/preferences.slice";
import { fadeInUp, staggerContainer } from "../utils/animations";
import { getImageBaseUrl } from "../utils/api";
import { formatCurrency } from "../utils/formatters";
import { getImageSrc, IMAGE_PLACEHOLDER } from "../utils/imagePlaceholder";
import { highlightSearch } from "../utils/searchHighlight";

export default function Services() {
	const { data, isLoading, error, refetch } = useServices();
	usePageTitle("Services");
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const prefs = useSelector((state: any) => state.preferences);
	const [q, setQ] = useState("");
	const [maxPrice, setMaxPrice] = useState<number | "">("");

	const sort = prefs?.servicesSort || "price-asc";
	const view = prefs?.servicesView || "grid";

	const list = useServiceFilters({
		services: data,
		searchQuery: q,
		maxPrice,
		sort,
	});

	if (isLoading) return <Loading message="Loading services…" />;
	if (error)
		return (
			<Alert variant="danger" className="d-flex align-items-center justify-content-between">
				<div>Failed to load services.</div>
				<Button size="sm" variant="outline-light" onClick={() => refetch()}>
					Retry
				</Button>
			</Alert>
		);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="py-4"
		>
			{/* Hero Section */}
			<motion.div className="mb-5" {...fadeInUp} transition={{ delay: 0.2 }}>
				<div className="d-flex align-items-center gap-3 mb-4">
					<MdBuild size={48} className="text-primary" />
					<div>
						<h1 className="mb-0">Our Services</h1>
						<p className="text-muted mb-0">
							Browse our comprehensive range of automotive services. Find exactly what your vehicle needs.
						</p>
					</div>
				</div>
			</motion.div>

			{/* Filters & Controls */}
			<motion.div className="mb-4" {...fadeInUp} transition={{ delay: 0.3 }}>
				<Row className="g-3 align-items-end">
					<Col xs={12} md={6} lg={4}>
						<Form.Label className="small text-muted">Search</Form.Label>
						<Autocomplete
							value={q}
							onChange={setQ}
							onSelect={(service) => {
								navigate(`/services/${service.id}`);
							}}
							services={data}
							placeholder="Search by name or description..."
							ariaLabel="Search services by name or description"
							maxSuggestions={5}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<Form.Label className="small text-muted">Max Price</Form.Label>
						<Form.Control
							type="number"
							placeholder="No limit"
							value={maxPrice}
							onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
							min="0"
							step="0.01"
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<Form.Label className="small text-muted">Sort</Form.Label>
						<InputGroup>
							<InputGroup.Text aria-hidden="true">
								<MdSort />
							</InputGroup.Text>
							<Form.Select
								value={sort}
								onChange={(e) => dispatch(setServicesSort(e.target.value as ServicesSort))}
								aria-label="Sort by price"
							>
								<option value="price-asc">Price: Low → High</option>
								<option value="price-desc">Price: High → Low</option>
							</Form.Select>
						</InputGroup>
					</Col>
					<Col xs={12} md="auto" lg={2} className="ms-md-auto">
						<Form.Label className="small text-muted">View</Form.Label>
						<InputGroup>
							<Button
								variant={view === "grid" ? "primary" : "outline-primary"}
								onClick={() => dispatch(setServicesView("grid" as ServicesView))}
								aria-label="Grid view"
							>
								<MdViewModule />
							</Button>
							<Button
								variant={view === "list" ? "primary" : "outline-primary"}
								onClick={() => dispatch(setServicesView("list" as ServicesView))}
								aria-label="List view"
							>
								<MdViewList />
							</Button>
						</InputGroup>
					</Col>
				</Row>
				{list.length > 0 && (
					<div className="mt-3 text-muted small">
						Showing {list.length} {list.length === 1 ? "service" : "services"}
					</div>
				)}
			</motion.div>

			{/* Services Display */}
			{list.length > 0 ? (
				view === "grid" ? (
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						style={{ width: "100%" }}
					>
						<Row xs={1} sm={2} md={3} lg={4} className="g-4">
							{list.map((service) => {
								const imageSrc = getImageSrc(service.imageUrl, getImageBaseUrl());
								const isPlaceholder = !service.imageUrl || service.imageUrl.trim() === "";

								return (
									<Col key={service.id}>
										<motion.div
											variants={fadeInUp}
											whileHover={{ y: -5 }}
											transition={{ type: "spring", stiffness: 300 }}
										>
											<Link
												to={`/services/${service.id}`}
												style={{ textDecoration: "none", color: "inherit" }}
											>
												<Card className="h-100 shadow-sm" style={{ cursor: "pointer" }}>
													<div
														style={{
															position: "relative",
															width: "100%",
															height: 200,
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
																padding: isPlaceholder ? "1rem" : "0",
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
																top: 8,
																right: 8,
															}}
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
															}}
														>
															<FavouriteButton id={service.id} />
														</div>
													</div>
													<Card.Body>
														<Card.Title className="mb-2">
															{q ? highlightSearch(service.name, q) : service.name}
														</Card.Title>
														<div className="fw-bold text-primary fs-5 mb-2">{formatCurrency(service.price)}</div>
														{service.description && (
															<Card.Text
																className="text-muted small"
																style={{
																	display: "-webkit-box",
																	WebkitLineClamp: 3,
																	WebkitBoxOrient: "vertical",
																	overflow: "hidden",
																}}
															>
																{q ? highlightSearch(service.description, q) : service.description}
															</Card.Text>
														)}
													</Card.Body>
												</Card>
											</Link>
										</motion.div>
									</Col>
								);
							})}
						</Row>
					</motion.div>
				) : (
					<motion.div variants={staggerContainer} initial="initial" animate="animate">
						<div className="table-responsive">
							<Table striped bordered hover>
								<thead>
									<tr>
										<th style={{ width: 120 }}>Image</th>
										<th>Name</th>
										<th>Price</th>
										<th>Description</th>
										<th style={{ width: 100 }}>Favorite</th>
									</tr>
								</thead>
								<tbody>
									{list.map((service) => {
										const imageSrc = getImageSrc(service.imageUrl, getImageBaseUrl());
										return (
											<motion.tr
												key={service.id}
												variants={fadeInUp}
												whileHover={{ backgroundColor: "var(--bs-secondary-bg)" }}
											>
												<td>
													<Image
														src={imageSrc}
														alt={service.name}
														thumbnail
														style={{
															maxWidth: 100,
															maxHeight: 100,
															objectFit: "cover",
															width: "100%",
															height: "auto",
														}}
														onError={(e) => {
															if ((e.currentTarget as HTMLImageElement).src !== IMAGE_PLACEHOLDER) {
																(e.currentTarget as HTMLImageElement).src = IMAGE_PLACEHOLDER;
															}
														}}
													/>
												</td>
												<td>
													<Link
														to={`/services/${service.id}`}
														style={{ textDecoration: "none", color: "inherit" }}
													>
														<strong>{q ? highlightSearch(service.name, q) : service.name}</strong>
													</Link>
												</td>
												<td>
													<Link
														to={`/services/${service.id}`}
														style={{ textDecoration: "none", color: "inherit" }}
													>
														<span className="fw-bold text-primary">{formatCurrency(service.price)}</span>
													</Link>
												</td>
												<td>
													<Link
														to={`/services/${service.id}`}
														style={{ textDecoration: "none", color: "inherit" }}
													>
														<span className="text-muted">
															{q ? highlightSearch(service.description || "", q) : service.description}
														</span>
													</Link>
												</td>
												<td className="text-center" onClick={(e) => e.stopPropagation()}>
													<FavouriteButton id={service.id} />
												</td>
											</motion.tr>
										);
									})}
								</tbody>
							</Table>
						</div>
					</motion.div>
				)
			) : (
				<motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
					<Alert variant="info" className="text-center">
						<MdBuild size={48} className="mb-3 text-primary" />
						<h4>No services found</h4>
						<p className="mb-0">
							{q || maxPrice
								? "Try adjusting your search or filters to find what you're looking for."
								: "No services are currently available. Check back soon!"}
						</p>
						{(q || maxPrice) && (
							<Button
								variant="outline-primary"
								className="mt-3"
								onClick={() => {
									setQ("");
									setMaxPrice("");
								}}
							>
								Clear Filters
							</Button>
						)}
					</Alert>
				</motion.div>
			)}
		</motion.div>
	);
}
