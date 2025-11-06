/**
 * @author Bob's Garage Team
 * @purpose Contact page with contact form and business information
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { MdEmail, MdLocalPhone, MdLocationOn, MdSchedule, MdSend } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../components/ui/ToastProvider";
import usePageTitle from "../hooks/usePageTitle";

const fadeInUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5 },
};

export default function Contact() {
	usePageTitle("Contact Us");
	const { notify } = useToast();
	const [searchParams] = useSearchParams();
	const serviceName = searchParams.get("service");

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: serviceName ? `Inquiry about ${serviceName}` : "",
		message: serviceName ? `I'm interested in learning more about: ${serviceName}\n\n` : "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setShowSuccess(false);

		// Create mailto link
		const subject = encodeURIComponent(formData.subject || "General Inquiry");
		const body = encodeURIComponent(
			`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
		);
		const mailtoLink = `mailto:info@bobsgarage.com.au?subject=${subject}&body=${body}`;

		// Open email client
		window.location.href = mailtoLink;

		// Show success message after a brief delay
		setTimeout(() => {
			setShowSuccess(true);
			setIsSubmitting(false);
			notify({
				title: "Email Client Opened",
				body: "Your email client should open shortly with a pre-filled message.",
				variant: "success",
			});
		}, 500);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="py-4"
		>
			<motion.div {...fadeInUp}>
				<h1 className="mb-4">Contact Us</h1>
				<p className="lead mb-5">
					Have a question or want to book a service? Get in touch with us and we'll get back to you
					as soon as possible.
				</p>
			</motion.div>

			<Row className="g-4">
				{/* Contact Form */}
				<Col md={7}>
					<motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
						<Card className="shadow-sm">
							<Card.Body className="p-4 p-md-5">
								<h2 className="mb-4">Send us a Message</h2>
								{showSuccess && (
									<Alert variant="success" className="mb-4">
										Your email client should open shortly. If it doesn't, please contact us directly
										at <a href="mailto:info@bobsgarage.com.au">info@bobsgarage.com.au</a>
									</Alert>
								)}
								<Form onSubmit={handleSubmit}>
									<Form.Group className="mb-3">
										<Form.Label>Name *</Form.Label>
										<Form.Control
											type="text"
											name="name"
											value={formData.name}
											onChange={handleChange}
											required
											minLength={2}
											placeholder="Your name"
										/>
									</Form.Group>

									<Form.Group className="mb-3">
										<Form.Label>Email *</Form.Label>
										<Form.Control
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											placeholder="your.email@example.com"
										/>
									</Form.Group>

									<Form.Group className="mb-3">
										<Form.Label>Subject *</Form.Label>
										<Form.Control
											type="text"
											name="subject"
											value={formData.subject}
											onChange={handleChange}
											required
											placeholder="What is your inquiry about?"
										/>
									</Form.Group>

									<Form.Group className="mb-4">
										<Form.Label>Message *</Form.Label>
										<Form.Control
											as="textarea"
											rows={6}
											name="message"
											value={formData.message}
											onChange={handleChange}
											required
											minLength={10}
											placeholder="Tell us more about your inquiry..."
										/>
									</Form.Group>

									<Button
										type="submit"
										variant="primary"
										size="lg"
										disabled={isSubmitting}
										className="w-100"
									>
										<MdSend className="me-2" />
										{isSubmitting ? "Opening Email Client..." : "Send Message"}
									</Button>
								</Form>
							</Card.Body>
						</Card>
					</motion.div>
				</Col>

				{/* Contact Information */}
				<Col md={5}>
					<motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
						<Card className="shadow-sm h-100">
							<Card.Body className="p-4 p-md-5">
								<h2 className="mb-4">Get in Touch</h2>
								<div className="d-flex align-items-start mb-4">
									<MdLocationOn size={24} className="text-primary me-3 flex-shrink-0 mt-1" />
									<div>
										<strong>Address</strong>
										<br />
										123 Main Street
										<br />
										Your City, NSW 12345
									</div>
								</div>
								<div className="d-flex align-items-center mb-4">
									<MdLocalPhone size={24} className="text-primary me-3 flex-shrink-0" />
									<div>
										<strong>Phone:</strong>{" "}
										<a href="tel:+61212345678" className="text-decoration-none">
											(02) 1234 5678
										</a>
									</div>
								</div>
								<div className="d-flex align-items-center mb-4">
									<MdEmail size={24} className="text-primary me-3 flex-shrink-0" />
									<div>
										<strong>Email:</strong>{" "}
										<a href="mailto:info@bobsgarage.com.au" className="text-decoration-none">
											info@bobsgarage.com.au
										</a>
									</div>
								</div>
								<div className="d-flex align-items-start">
									<MdSchedule size={24} className="text-primary me-3 flex-shrink-0 mt-1" />
									<div>
										<strong>Business Hours</strong>
										<br />
										Monday - Friday: 8:00 AM - 6:00 PM
										<br />
										Saturday: 9:00 AM - 4:00 PM
										<br />
										Sunday: Closed
									</div>
								</div>
							</Card.Body>
						</Card>
					</motion.div>
				</Col>
			</Row>
		</motion.div>
	);
}
