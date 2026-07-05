import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg-deep)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⚡</div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-blue))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Something went wrong
          </h1>
          <p
            className="text-muted"
            style={{
              fontSize: '1.1rem',
              maxWidth: '500px',
              marginBottom: '2rem',
              lineHeight: 1.7,
            }}
          >
            Neon Hub ran into an unexpected issue. Don't worry — your data is safe. Try going back to the home page.
          </p>
          <button
            className="btn btn-primary px-4 py-2"
            onClick={this.handleReset}
            style={{ borderRadius: '20px', fontWeight: 600 }}
          >
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
