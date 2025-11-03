import { Card, Col, Row } from 'react-bootstrap';
import { useStaffList } from '../hooks/useStaff';
import Loading from '../components/ui/Loading';
import usePageTitle from '../hooks/usePageTitle';

const API_BASE =
  (import.meta as ImportMeta).env?.VITE_API_URL?.replace(/\/$/, '')?.replace(
    /\/api$/,
    '',
  ) ?? 'http://localhost:4000';

const SVG_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
		<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
			<rect width='100%' height='100%' fill='#dee2e6'/>
			<g fill='#6c757d' font-family='Arial, Helvetica, sans-serif' font-size='20'>
				<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>No image</text>
			</g>
		</svg>
	`);

export default function Staff() {
  const { data, isLoading, error } = useStaffList();
  usePageTitle('Staff');
  if (isLoading) return <Loading message="Loading staff…" />;
  if (error) return <p>Failed to load staff.</p>;

  const staff = (data ?? []).filter((m) => m.active !== false);

  return (
    <div>
      <h1>Meet the Team</h1>
      <Row xs={1} md={2} lg={4} className="g-3">
        {staff.map((m) => {
          const photoSrc = m.photoUrl
            ? m.photoUrl.startsWith('http')
              ? m.photoUrl
              : `${API_BASE}${m.photoUrl}`
            : undefined;

          return (
            <Col key={m.id}>
              <Card>
                {photoSrc ? (
                  <Card.Img
                    variant="top"
                    src={photoSrc}
                    alt={`${m.name} photo`}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        SVG_PLACEHOLDER;
                    }}
                  />
                ) : (
                  <Card.Img
                    variant="top"
                    src={SVG_PLACEHOLDER}
                    alt="placeholder"
                  />
                )}
                <Card.Body>
                  <Card.Title className="mb-1">{m.name}</Card.Title>
                  {m.role && <div className="text-muted mb-2">{m.role}</div>}
                  {m.bio && (
                    <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                      {m.bio}
                    </Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
