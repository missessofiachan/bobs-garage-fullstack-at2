/**
 * @author Bob's Garage Team
 * @purpose Accessibility statement page
 * @version 1.0.0
 */

import { motion } from 'framer-motion';
import { Card, ListGroup } from 'react-bootstrap';
import { MdAccessibility, MdKeyboard, MdSettings, MdVisibility } from 'react-icons/md';
import usePageTitle from '../hooks/usePageTitle';

export default function Accessibility() {
  usePageTitle('Accessibility');

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
                  <MdAccessibility size={64} className="text-primary mb-3" />
                  <h1>Accessibility Statement</h1>
                  <p className="text-muted">Our commitment to inclusive design</p>
                </div>

                <div className="content" style={{ lineHeight: '1.8' }}>
                  <section className="mb-4">
                    <h2>Our Commitment</h2>
                    <p>
                      Bob's Garage is committed to ensuring digital accessibility for people with
                      disabilities. We are continually improving the user experience for everyone
                      and applying the relevant accessibility standards to achieve WCAG 2.1 Level AA
                      compliance.
                    </p>
                  </section>

                  <section className="mb-4">
                    <h2>Accessibility Features</h2>
                    <p>Our website includes the following accessibility features:</p>
                    <ListGroup className="mb-3">
                      <ListGroup.Item>
                        <MdVisibility className="me-2 text-primary" />
                        <strong>High Contrast Mode:</strong> Available in Settings to improve
                        visibility
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <MdKeyboard className="me-2 text-primary" />
                        <strong>Keyboard Navigation:</strong> Full site navigation using only
                        keyboard
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <MdSettings className="me-2 text-primary" />
                        <strong>Reduced Motion:</strong> Option to disable animations for motion
                        sensitivity
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Text Size Options:</strong> Adjustable font sizes (small, medium,
                        large)
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Screen Reader Support:</strong> Semantic HTML and ARIA labels
                        throughout
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Alt Text:</strong> Descriptive text for all images
                      </ListGroup.Item>
                    </ListGroup>
                  </section>

                  <section className="mb-4">
                    <h2>Customization Options</h2>
                    <p>
                      You can customize your experience by visiting the{' '}
                      <a href="/settings">Settings page</a> where you can:
                    </p>
                    <ul>
                      <li>Enable high contrast mode for better visibility</li>
                      <li>Reduce motion for users sensitive to animation</li>
                      <li>Adjust font sizes to your preference</li>
                      <li>Change text density (comfortable or compact)</li>
                    </ul>
                  </section>

                  <section className="mb-4">
                    <h2>Feedback</h2>
                    <p>
                      We welcome your feedback on the accessibility of Bob's Garage. If you
                      encounter accessibility barriers, please contact us:
                    </p>
                    <ul>
                      <li>
                        Email: <a href="mailto:info@bobsgarage.com.au">info@bobsgarage.com.au</a>
                      </li>
                      <li>Phone: (02) 1234 5678</li>
                    </ul>
                    <p>
                      We aim to respond to accessibility feedback within 5 business days and will
                      provide a solution or update within 30 days when possible.
                    </p>
                  </section>

                  <section className="mb-4">
                    <h2>Standards Compliance</h2>
                    <p>
                      This website strives to conform to Level AA of the World Wide Web Consortium
                      (W3C) Web Content Accessibility Guidelines (WCAG) 2.1. These guidelines
                      explain how to make web content more accessible for people with disabilities.
                    </p>
                  </section>

                  <section className="mb-4">
                    <h2>Ongoing Improvements</h2>
                    <p>
                      We are continuously working to improve the accessibility of our website. We
                      regularly review our site and make updates to ensure we meet accessibility
                      standards. If you notice an issue, please let us know.
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
