import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, info.componentStack);
    this.setState({ error, errorInfo: info });
    // Intentionally NEVER auto-reload window.location.reload() here.
    // Auto-reloading inside componentDidCatch causes white blank screen loops.
  }

  handleReset = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('edudiscovery_error_reload');
      localStorage.removeItem('edudiscovery_error_time');
    } catch (e) {}

    const isHookError = this.state.error?.message?.includes('useState') || 
                        this.state.error?.message?.includes('useContext') ||
                        this.state.error?.message?.includes('dispatcher');

    const isDynamicImportError = this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
                                 this.state.error?.message?.includes('Importing a module script failed');

    if (isHookError || isDynamicImportError) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleNavigateHome = () => {
    try {
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/';
  };

  handleHardRefresh = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) { await r.unregister(); }
      }
      if ('caches' in window) {
        const names = await caches.keys();
        for (const name of names) { await caches.delete(name); }
      }
    } catch (e) {}
    window.location.replace('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          textAlign: 'center',
          background: 'var(--bg, #f8fafc)',
          color: 'var(--text-main, #0f172a)',
          gap: '16px',
          borderRadius: '16px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: '#EF4444'
          }}>
            ⚡
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: 'var(--text-main, #0f172a)' }}>
            {this.props.fallbackTitle || 'Seamless Recovery Activated'}
          </h1>

          <p style={{ color: 'var(--text-muted, #64748b)', maxWidth: '440px', lineHeight: 1.6, fontSize: '14px', margin: 0 }}>
            An unexpected render state occurred. EduDiscovery prevented a screen freeze so your session remains protected.
          </p>

          {this.state.error && (
            <div style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              background: 'rgba(239, 68, 68, 0.05)',
              color: '#DC2626',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '10px 14px',
              borderRadius: '10px',
              maxWidth: '520px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              textAlign: 'left',
              marginTop: '4px'
            }}>
              {this.state.error.message || 'Component render failed'}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 24px',
                borderRadius: '999px',
                fontWeight: '800',
                fontSize: '13.5px',
                color: '#fff',
                background: 'var(--primary, #059669)',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              }}
            >
              Recover View
            </button>

            <button
              onClick={this.handleNavigateHome}
              style={{
                padding: '12px 24px',
                borderRadius: '999px',
                fontWeight: '800',
                fontSize: '13.5px',
                color: 'var(--text-main, #0f172a)',
                background: 'var(--surface, #ffffff)',
                cursor: 'pointer',
                border: '1.5px solid var(--border, #e2e8f0)',
              }}
            >
              Explore Catalog
            </button>

            <button
              onClick={this.handleHardRefresh}
              style={{
                padding: '12px 20px',
                borderRadius: '999px',
                fontWeight: '700',
                fontSize: '13px',
                color: 'var(--text-muted, #64748b)',
                background: 'transparent',
                cursor: 'pointer',
                border: '1px dashed var(--border, #cbd5e1)',
              }}
            >
              Clear Cache &amp; Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
