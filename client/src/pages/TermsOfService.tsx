/**
 * @author Bob's Garage Team
 * @purpose Terms of Service page
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import { Card } from "react-bootstrap";
import usePageTitle from "../hooks/usePageTitle";
import { MdGavel } from "react-icons/md";

export default function TermsOfService() {
	usePageTitle("Terms of Service");

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="py-4"
		>
			<div className="row justify-content-center">
				<div className="col-12 col-lg-10 col-xl-8">
					<motion.div
						initial={{ scale: 0.95 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, duration: 0.4 }}
					>
						<Card className="shadow-sm">
							<Card.Body className="p-4 p-md-5">
								<div className="text-center mb-4">
									<MdGavel size={64} className="text-primary mb-3" />
									<h1>Terms of Service</h1>
									<p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
								</div>

								<div className="content" style={{ lineHeight: "1.8" }}>
									<section className="mb-4">
										<h2>Agreement to Terms</h2>
										<p>
											By accessing or using Bob's Garage website and services, you agree to be bound by these Terms of
											Service and all applicable laws and regulations. If you do not agree with any of these terms, you
											are prohibited from using or accessing this site.
										</p>
									</section>

									<section className="mb-4">
										<h2>Use License</h2>
										<p>
											Permission is granted to temporarily access the materials on Bob's Garage website for personal,
											non-commercial transitory viewing only. This is the grant of a license, not a transfer of title,
											and under this license you may not:
										</p>
										<ul>
											<li>Modify or copy the materials</li>
											<li>Use the materials for any commercial purpose</li>
											<li>Attempt to reverse engineer any software contained on the website</li>
											<li>Remove any copyright or other proprietary notations from the materials</li>
										</ul>
									</section>

									<section className="mb-4">
										<h2>User Accounts</h2>
										<p>
											When you create an account with us, you must provide information that is accurate, complete, and
											current. You are responsible for safeguarding the password and for all activities that occur under
											your account.
										</p>
									</section>

									<section className="mb-4">
										<h2>Service Availability</h2>
										<p>
											We reserve the right to withdraw or amend our website and any service or material we provide on the
											website in our sole discretion without notice. We will not be liable if, for any reason, all or
											any part of the website is unavailable at any time or for any period.
										</p>
									</section>

									<section className="mb-4">
										<h2>Prohibited Uses</h2>
										<p>You may not use our website:</p>
										<ul>
											<li>In any way that violates any applicable law or regulation</li>
											<li>To transmit any malicious code or viruses</li>
											<li>To impersonate or attempt to impersonate the company or other users</li>
											<li>In any way that infringes upon the rights of others</li>
										</ul>
									</section>

									<section className="mb-4">
										<h2>Limitation of Liability</h2>
										<p>
											In no event shall Bob's Garage or its suppliers be liable for any damages arising out of the use or
											inability to use the materials on our website, even if we have been notified of the possibility of
											such damage.
										</p>
									</section>

									<section className="mb-4">
										<h2>Contact Information</h2>
										<p>
											If you have questions about these Terms of Service, please contact us at{" "}
											<a href="mailto:info@bobsgarage.com.au">info@bobsgarage.com.au</a>.
										</p>
									</section>
								</div>
							</Card.Body>
						</Card>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}

