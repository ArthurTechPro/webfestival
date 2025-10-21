import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#1a1a2e',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>
            ❌ Error en la Aplicación
          </h1>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            maxWidth: '600px',
            textAlign: 'left'
          }}>
            <h3>Error:</h3>
            <pre style={{ fontSize: '0.9rem', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
            {this.state.errorInfo && (
              <>
                <h3>Stack Trace:</h3>
                <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              background: '#346CB0',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;