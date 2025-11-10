/**
 * @author Bob's Garage Team
 * @purpose About page component displaying comprehensive garage information
 * @version 2.0.0
 */

import { motion } from 'framer-motion';
import { Card, Col, Row } from 'react-bootstrap';
import {
  MdAccessTime,
  MdBuild,
  MdCheckCircle,
  MdEmail,
  MdGroups,
  MdHandshake,
  MdHistory,
  MdLocalPhone,
  MdLocationOn,
  MdPeople,
  MdPriceCheck,
  MdSchedule,
  MdSecurity,
  MdStar,
  MdVerified,
  MdWorkspacePremium,
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import { fadeInUp, staggerContainer } from '../utils/animations';
import Staff from './Staff';

export default function About() {
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
            className="display-4 fw-bold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            About Bob's Garage
          </motion.h1>
          <motion.p
            className="col-md-10 fs-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            For over 20 years, Bob's Garage has been the trusted choice for automotive repairs and
            maintenance in our community. Our certified mechanics and friendly reception team are
            dedicated to keeping your vehicle running smoothly with honest service and fair pricing.
          </motion.p>
        </div>
      </motion.div>

      {/* Statistics Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 0.5 }}>
        <Row className="g-3">
          <Col xs={6} md={3}>
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="display-4 fw-bold text-primary">20+</div>
                <div className="text-muted">Years Serving</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="display-4 fw-bold text-primary">5000+</div>
                <div className="text-muted">Happy Customers</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="display-4 fw-bold text-primary">100%</div>
                <div className="text-muted">Satisfaction</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="display-4 fw-bold text-primary">A+</div>
                <div className="text-muted">Rating</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.section>

      {/* Our Story Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 0.6 }}>
        <h2 className="mb-4">
          <MdHistory className="me-2 text-primary" />
          Our Story
        </h2>
        <Row className="g-4">
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <h4 className="text-primary mb-3">The Beginning (2004)</h4>
                <p>
                  Bob's Garage started as a small family business with a simple mission: provide
                  honest, reliable automotive service to our neighbors. What began as a one-bay
                  garage has grown into a trusted community institution.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <h4 className="text-primary mb-3">Growing Together (2010-2015)</h4>
                <p>
                  As word spread about our commitment to quality and fair pricing, we expanded our
                  facilities and added more certified technicians. We invested in the latest
                  diagnostic equipment to better serve our customers.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <h4 className="text-primary mb-3">Community Leaders (2016-2020)</h4>
                <p>
                  We became deeply involved in our community, sponsoring local events and supporting
                  local charities. Our commitment to environmental responsibility led us to
                  implement eco-friendly practices and recycling programs.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <h4 className="text-primary mb-3">Today & Beyond (2021-)</h4>
                <p>
                  Today, Bob's Garage continues to evolve, embracing new technologies while
                  maintaining our core values of honesty, quality, and customer-first service. We're
                  proud to be your trusted automotive partner.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.section>

      {/* Mission & Values Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 0.7 }}>
        <Row className="g-4">
          <Col md={6}>
            <Card className="h-100 bg-body-secondary">
              <Card.Body className="p-4">
                <h2 className="mb-4">Our Mission</h2>
                <p className="fs-5">
                  To provide exceptional automotive services that keep our customers' vehicles safe,
                  reliable, and performing at their best, while treating every customer with
                  respect, honesty, and integrity.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Body className="p-4">
                <h2 className="mb-4">Our Values</h2>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-start">
                    <MdCheckCircle size={24} className="text-primary me-2 flex-shrink-0" />
                    <span>
                      <strong>Honesty:</strong> Transparent communication and fair pricing
                    </span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <MdCheckCircle size={24} className="text-primary me-2 flex-shrink-0" />
                    <span>
                      <strong>Quality:</strong> Using premium parts and expert craftsmanship
                    </span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <MdCheckCircle size={24} className="text-primary me-2 flex-shrink-0" />
                    <span>
                      <strong>Respect:</strong> Treating customers and their vehicles with care
                    </span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <MdCheckCircle size={24} className="text-primary me-2 flex-shrink-0" />
                    <span>
                      <strong>Community:</strong> Supporting our local neighborhood and environment
                    </span>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.section>

      {/* What Makes Us Different Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 0.8 }}>
        <h2 className="mb-4">What Makes Us Different</h2>
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <Row className="g-3">
            <Col md={6} lg={4}>
              <motion.div variants={fadeInUp}>
                <Card className="h-100">
                  <Card.Body>
                    <MdSecurity size={40} className="text-primary mb-3" />
                    <Card.Title>Certified & Insured</Card.Title>
                    <Card.Text>
                      All our mechanics are ASE certified and fully insured for your peace of mind.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={6} lg={4}>
              <motion.div variants={fadeInUp}>
                <Card className="h-100">
                  <Card.Body>
                    <MdAccessTime size={40} className="text-primary mb-3" />
                    <Card.Title>Fast & Efficient</Card.Title>
                    <Card.Text>
                      We understand your time is valuable. Most repairs completed same-day or within
                      24 hours.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={6} lg={4}>
              <motion.div variants={fadeInUp}>
                <Card className="h-100">
                  <Card.Body>
                    <MdPriceCheck size={40} className="text-primary mb-3" />
                    <Card.Title>Fair Pricing</Card.Title>
                    <Card.Text>
                      No hidden fees or surprise charges. We provide detailed quotes before any work
                      begins.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={6} lg={4}>
              <motion.div variants={fadeInUp}>
                <Card className="h-100">
                  <Card.Body>
                    <MdVerified size={40} className="text-primary mb-3" />
                    <Card.Title>Warranty on Work</Card.Title>
                    <Card.Text>
                      All our repairs come with a comprehensive warranty. We stand behind our work.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={6} lg={4}>
              <motion.div variants={fadeInUp}>
                <Card className="h-100">
                  <Card.Body>
                    <MdBuild size={40} className="text-primary mb-3" />
                    <Card.Title>Modern Equipment</Card.Title>
                    <Card.Text>
                      State-of-the-art diagnostic tools and equipment for accurate assessments and
                      repairs.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={6} lg={4}>
              <motion.div variants={fadeInUp}>
                <Card className="h-100">
                  <Card.Body>
                    <MdPeople size={40} className="text-primary mb-3" />
                    <Card.Title>Expert Team</Card.Title>
                    <Card.Text>
                      Years of combined experience across all makes and models. We've seen it all!
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </motion.section>

      {/* Our Commitment Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 0.9 }}>
        <Card className="bg-body-secondary">
          <Card.Body className="p-4 p-md-5">
            <h2 className="mb-4">Our Commitment to You</h2>
            <Row className="g-4">
              <Col md={6}>
                <div className="d-flex align-items-start mb-3">
                  <MdHandshake size={32} className="text-primary me-3 flex-shrink-0" />
                  <div>
                    <h5>Honest Communication</h5>
                    <p className="mb-0">
                      We'll always explain what needs to be done and why, in terms you can
                      understand. No technical jargon, just straight talk.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start mb-3">
                  <MdStar size={32} className="text-primary me-3 flex-shrink-0" />
                  <div>
                    <h5>Quality Guarantee</h5>
                    <p className="mb-0">
                      We use only quality parts and materials, and our workmanship is guaranteed. If
                      something's not right, we'll make it right.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start mb-3">
                  <MdCheckCircle size={32} className="text-primary me-3 flex-shrink-0" />
                  <div>
                    <h5>Respect for Your Time</h5>
                    <p className="mb-0">
                      We know your car is essential to your daily life. We work efficiently to get
                      you back on the road as quickly as possible.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start mb-3">
                  <MdSecurity size={32} className="text-primary me-3 flex-shrink-0" />
                  <div>
                    <h5>Safety First</h5>
                    <p className="mb-0">
                      Your safety and the safety of your family is our top priority. We never cut
                      corners on safety-critical repairs.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.section>

      {/* Certifications Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 1.0 }}>
        <h2 className="mb-4">
          <MdWorkspacePremium className="me-2 text-primary" />
          Certifications & Credentials
        </h2>
        <Row className="g-3">
          <Col md={6} lg={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <MdVerified size={48} className="text-primary mb-3" />
                <Card.Title>ASE Certified</Card.Title>
                <Card.Text>
                  All our mechanics hold Automotive Service Excellence certifications
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <MdSecurity size={48} className="text-primary mb-3" />
                <Card.Title>Fully Insured</Card.Title>
                <Card.Text>
                  Comprehensive insurance coverage for your protection and peace of mind
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <MdStar size={48} className="text-primary mb-3" />
                <Card.Title>BBB Accredited</Card.Title>
                <Card.Text>
                  Better Business Bureau A+ rating for outstanding customer service
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.section>

      {/* Community Involvement Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 1.1 }}>
        <h2 className="mb-4">
          <MdGroups className="me-2 text-primary" />
          Community Involvement
        </h2>
        <Card className="bg-body-secondary">
          <Card.Body className="p-4 p-md-5">
            <Row className="g-4">
              <Col md={6}>
                <h4 className="mb-3">Giving Back</h4>
                <p>
                  Bob's Garage is more than just a business—we're part of the community. We're proud
                  to support:
                </p>
                <ul>
                  <li>Local school fundraisers and events</li>
                  <li>Community sports teams and leagues</li>
                  <li>Environmental initiatives and recycling programs</li>
                  <li>Charity drives and food banks</li>
                  <li>Senior citizen discount programs</li>
                </ul>
              </Col>
              <Col md={6}>
                <h4 className="mb-3">Environmental Responsibility</h4>
                <p>
                  We care about the planet as much as we care about your car. Our commitment
                  includes:
                </p>
                <ul>
                  <li>Recycling all used oil, batteries, and parts</li>
                  <li>Using eco-friendly cleaning products</li>
                  <li>Proper disposal of hazardous materials</li>
                  <li>Energy-efficient shop lighting and equipment</li>
                  <li>Supporting local environmental initiatives</li>
                </ul>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.section>

      {/* Our Team Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 1.2 }}>
        <h2 className="mb-4">Meet Our Team</h2>
        <p className="lead mb-4">
          Our experienced and friendly team is here to help you with all your automotive needs.
        </p>
        <Staff />
      </motion.section>

      {/* CTA & Location Section */}
      <motion.section className="mb-5" {...fadeInUp} transition={{ delay: 1.3 }}>
        <Card className="bg-body-secondary">
          <Card.Body className="p-4 p-md-5">
            <Row>
              <Col md={6} className="mb-4 mb-md-0">
                <h2 className="mb-4">Visit Us Today</h2>
                <p className="fs-5 mb-4">
                  Experience the Bob's Garage difference. Stop by for a free inspection or schedule
                  your service online.
                </p>
                <Link to="/services" className="btn btn-primary btn-lg me-2 mb-2">
                  View Our Services
                </Link>
                <Link to="/" className="btn btn-outline-secondary btn-lg mb-2">
                  Back to Home
                </Link>
              </Col>
              <Col md={6}>
                <h3 className="mb-3">Get in Touch</h3>
                <div className="d-flex align-items-start mb-3">
                  <MdLocationOn size={24} className="text-primary me-3 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Address</strong>
                    <br />
                    123 Main Street
                    <br />
                    Your City, NSW 12345
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <MdLocalPhone size={24} className="text-primary me-3 flex-shrink-0" />
                  <div>
                    <strong>Phone:</strong> (02) 1234 5678
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <MdEmail size={24} className="text-primary me-3 flex-shrink-0" />
                  <div>
                    <strong>Email:</strong> info@bobsgarage.com.au
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
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.section>
    </motion.div>
  );
}
