/**
 * @author Bob's Garage Team
 * @purpose Staff page displaying team members with animations and improved layout
 * @version 2.0.0
 */

import { motion } from "framer-motion";
import { Card, Col, Row, Image, Alert, Button } from "react-bootstrap";
import { useStaffList } from "../hooks/useStaff";
import Loading from "../components/ui/Loading";
import usePageTitle from "../hooks/usePageTitle";
import { getImageBaseUrl } from "../utils/api";
import { getImageSrc, IMAGE_PLACEHOLDER } from "../utils/imagePlaceholder";
import { MdPeople } from "react-icons/md";

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

export default function Staff() {
	const { data, isLoading, error, refetch } = useStaffList();
	usePageTitle("Meet the Team");

	if (isLoading) return <Loading message="Loading staff…" />;
	if (error)
		return (
			<Alert variant="danger" className="d-flex align-items-center justify-content-between">
				<div>Failed to load staff members.</div>
				<Button size="sm" variant="outline-light" onClick={() => refetch()}>
					Retry
				</Button>
			</Alert>
		);

	const staff = (data ?? []).filter((m) => m.active !== false);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="py-4"
		>
			{/* Hero Section */}
			<motion.div
				className="mb-5"
				{...fadeInUp}
				transition={{ delay: 0.2 }}
			>
				<div className="d-flex align-items-center gap-3 mb-3">
					<MdPeople size={48} className="text-primary" />
					<div>
						<h1 className="mb-0">Meet the Team</h1>
						<p className="text-muted mb-0">
							Our experienced and friendly team is here to help you with all your automotive needs.
						</p>
					</div>
				</div>
			</motion.div>

			{/* Staff Cards */}
			{staff.length > 0 ? (
				<motion.div
					variants={staggerContainer}
					initial="initial"
					animate="animate"
				>
					<Row xs={1} sm={2} md={3} lg={4} className="g-4">
						{staff.map((member) => {
							const photoSrc = getImageSrc(member.photoUrl, getImageBaseUrl());
							const isPlaceholder = !member.photoUrl || member.photoUrl.trim() === "";

							return (
								<Col key={member.id}>
									<motion.div
										variants={fadeInUp}
										whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
									>
										<Card className="h-100 shadow-sm">
											<div
												style={{
													position: "relative",
													width: "100%",
													height: 350,
													overflow: "hidden",
													backgroundColor: isPlaceholder ? "#f3f4f6" : "transparent",
												}}
											>
												<Image
													src={photoSrc}
													alt={`${member.name} photo`}
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
											</div>
											<Card.Body>
												<Card.Title className="mb-2">{member.name}</Card.Title>
												{member.role && (
													<div className="text-primary fw-semibold mb-3 small text-uppercase">
														{member.role}
													</div>
												)}
												{member.bio && (
													<Card.Text
														className="text-muted small"
														style={{
															whiteSpace: "pre-wrap",
															lineHeight: "1.6",
															display: "-webkit-box",
															WebkitLineClamp: 4,
															WebkitBoxOrient: "vertical",
															overflow: "hidden",
														}}
													>
														{member.bio}
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
				<motion.div
					{...fadeInUp}
					transition={{ delay: 0.3 }}
				>
					<Alert variant="info" className="text-center">
						<MdPeople size={48} className="mb-3 text-primary" />
						<h4>No team members available</h4>
						<p className="mb-0">Check back soon to meet our amazing team!</p>
					</Alert>
				</motion.div>
			)}
		</motion.div>
	);
}
