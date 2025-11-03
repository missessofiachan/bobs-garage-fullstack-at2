// route error boundary
import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading mb-3">Something went wrong</h4>
            <p className="mb-3">
              An unexpected error occurred while rendering this page.
            </p>
            {this.state.error && (
              <pre
                className="bg-body-secondary p-3 rounded small overflow-auto"
                style={{ maxHeight: 200 }}
              >
                {this.state.error.message}
              </pre>
            )}
            <div className="d-flex gap-2 mt-3">
              <a className="btn btn-primary" href="/">
                Go to Home
              </a>
              <button
                className="btn btn-outline-secondary"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
