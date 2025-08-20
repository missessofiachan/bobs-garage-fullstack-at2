import { Spinner } from 'react-bootstrap';

export default function Loading({ message }: { message?: string }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 160 }}>
      <Spinner animation="border" role="status" aria-hidden="true" />
      {message ? <div className="mt-2 text-muted" aria-live="polite">{message}</div> : null}
    </div>
  );
}
