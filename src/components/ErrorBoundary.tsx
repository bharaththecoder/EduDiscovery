import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--bg)',
          gap: '16px',
        }}>
          <div style={{ fontSize: '64px' }}>⚡</div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6, fontSize: '14px' }}>
            An unexpected error occurred. Our team has been notified. Try refreshing or returning home.
          </p>
          {this.state.error && (
            <code style={{
              fontSize: '12px',
              background: '#FFF1F2',
              color: '#E11D48',
              border: '1px solid #FECDD3',
              padding: '10px 16px',
              borderRadius: '10px',
              maxWidth: '500px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              textAlign: 'left',
            }}>
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={this.handleReset}
            style={{
              marginTop: '8px',
              padding: '13px 28px',
              borderRadius: '999px',
              fontWeight: '700',
              fontSize: '15px',
              color: '#fff',
              background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
            }}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
