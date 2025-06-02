import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>
            🚨 Something went wrong
          </h1>
          <p style={{ marginBottom: '20px', maxWidth: '600px' }}>
            The application encountered an error. This might be due to network connectivity issues or server problems.
          </p>
          <details style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            maxWidth: '800px',
            textAlign: 'left'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Click to see error details
            </summary>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word',
              fontSize: '12px',
              marginTop: '10px'
            }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
