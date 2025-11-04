/**
 * @author Bob's Garage Team
 * @purpose Privacy Policy page
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import { Card } from "react-bootstrap";
import { MdPrivacyTip } from "react-icons/md";
import usePageTitle from "../hooks/usePageTitle";

export default function PrivacyPolicy() {
	usePageTitle("Privacy Policy");

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
									<MdPrivacyTip size={64} className="text-primary mb-3" />
									<h1>Privacy Policy</h1>
									<p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
								</div>

								<div className="content" style={{ lineHeight: "1.8" }}>
									<section className="mb-4">
										<h2>Introduction</h2>
										<p>
											Bob's Garage ("we," "our," or "us") is committed to protecting your privacy.
											This Privacy Policy explains how we collect, use, disclose, and safeguard your
											information when you use our website and services.
										</p>
									</section>

									<section className="mb-4">
										<h2>Information We Collect</h2>
										<h3>Personal Information</h3>
										<p>
											We may collect personal information that you voluntarily provide to us,
											including:
										</p>
										<ul>
											<li>Email address</li>
											<li>Account credentials (password - stored securely)</li>
											<li>Service preferences and favorites</li>
											<li>Any other information you choose to provide</li>
										</ul>

										<h3>Automatically Collected Information</h3>
										<p>
											When you visit our website, we may automatically collect certain information
											about your device, including information about your web browser, IP address,
											time zone, and some of the cookies that are installed on your device.
										</p>
									</section>

									<section className="mb-4">
										<h2>How We Use Your Information</h2>
										<p>We use the information we collect to:</p>
										<ul>
											<li>Provide, maintain, and improve our services</li>
											<li>Process transactions and send related information</li>
											<li>Send you technical notices and support messages</li>
											<li>Respond to your comments and questions</li>
											<li>Monitor and analyze trends and usage</li>
										</ul>
									</section>

									<section className="mb-4">
										<h2>Data Security</h2>
										<p>
											We implement appropriate technical and organizational measures to protect your
											personal information against unauthorized access, alteration, disclosure, or
											destruction. However, no method of transmission over the Internet or
											electronic storage is 100% secure.
										</p>
									</section>

									<section className="mb-4">
										<h2>Your Rights</h2>
										<p>You have the right to:</p>
										<ul>
											<li>Access your personal information</li>
											<li>Correct inaccurate data</li>
											<li>Request deletion of your account</li>
											<li>Opt-out of marketing communications</li>
										</ul>
									</section>

									<section className="mb-4">
										<h2>Contact Us</h2>
										<p>
											If you have questions about this Privacy Policy, please contact us at{" "}
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
