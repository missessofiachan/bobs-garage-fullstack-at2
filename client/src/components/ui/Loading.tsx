/**
 * @author Bob's Garage Team
 * @purpose Loading spinner component with trans pride animation
 * @version 1.0.0
 */

import './TransPrideSpinner.css';

export default function Loading({ message }: { message?: string }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: 160 }}
    >
      <div className="trans-pride-spinner" aria-live="polite" aria-busy="true">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message ? (
        <div className="mt-3 text-muted" aria-live="polite" style={{ color: '#d1d5db' }}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
