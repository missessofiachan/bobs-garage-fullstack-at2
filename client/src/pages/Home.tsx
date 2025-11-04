/**
 * @author Bob's Garage Team
 * @purpose Home page with animated entrance
 * @version 2.0.0
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Home() {
	const { accessToken } = useSelector((s: any) => s.auth);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="py-4"
		>
			<motion.div
				className="p-4 p-md-5 mb-4 bg-body-secondary rounded-3"
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
						className="d-flex gap-2"
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
		</motion.div>
	);
}
