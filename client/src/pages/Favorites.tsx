/**
 * @author Bob's Garage Team
 * @purpose Dedicated page for displaying and managing user favorites
 * @version 1.0.0
 */

import { motion } from 'framer-motion';
import { Alert, Badge, Button, Card, Col, Image, Row } from 'react-bootstrap';
import { MdFavorite } from 'react-icons/md';
import { Link } from 'react-router-dom';
import FavouriteButton from '../components/FavouriteButton';
import Loading from '../components/ui/Loading';
import { useFavorites } from '../hooks/useFavorites';
import usePageTitle from '../hooks/usePageTitle';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { getImageBaseUrl } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { getImageSrc, IMAGE_PLACEHOLDER } from '../utils/imagePlaceholder';

export default function Favorites() {
  const { favorites, isLoading } = useFavorites();
  usePageTitle('My Favorites');

  if (isLoading) {
    return <Loading message="Loading favorites…" />;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <MdFavorite size={32} className="text-primary" />
          <h1 className="mb-0">My Favorites</h1>
          <Badge bg="secondary" className="fs-6">
            {favorites.length}
          </Badge>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <MdFavorite size={48} className="text-muted mb-3" />
          <h4>No favorites yet</h4>
          <p className="mb-3">
            You haven't favorited any services yet. Start exploring to add services you love!
          </p>
          <Button as={Link as any} to="/services" variant="primary">
            Browse Services
          </Button>
        </Alert>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ width: '100%' }}
        >
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {favorites.map((service) => {
              const imageSrc = getImageSrc(service.imageUrl, getImageBaseUrl());
              const isPlaceholder = !service.imageUrl || service.imageUrl.trim() === '';

              return (
                <Col key={service.id}>
                  <motion.div
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Link
                      to={`/services/${service.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Card className="h-100 shadow-sm" style={{ cursor: 'pointer' }}>
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: 200,
                            overflow: 'hidden',
                            backgroundColor: isPlaceholder ? '#f3f4f6' : 'transparent',
                          }}
                        >
                          <Image
                            src={imageSrc}
                            alt={service.name}
                            fluid
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: isPlaceholder ? 'contain' : 'cover',
                              padding: isPlaceholder ? '1rem' : '0',
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
                              position: 'absolute',
                              top: 8,
                              right: 8,
                            }}
                          >
                            <FavouriteButton id={service.id} />
                          </div>
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="mb-2">{service.name}</Card.Title>
                          <div className="fw-bold text-primary fs-5 mb-2">
                            {formatCurrency(service.price)}
                          </div>
                          {service.description && (
                            <Card.Text
                              className="text-muted small flex-grow-1"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {service.description}
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
      )}
    </div>
  );
}
