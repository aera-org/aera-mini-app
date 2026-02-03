import { Component, ErrorInfo } from 'react';
import { Text } from '../text';
import { Button } from '../button';
import { logger } from '../../utils/logger';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../../types/shared';

// Using types from shared

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #000000 0%, #1f2e43 101.07%)',
            color: 'white',
          }}
        >
          <Text variant="h1" color="white">
            Oops! Something went wrong
          </Text>
          <div style={{ margin: '20px 0' }}>
            <Text variant="span" color="white">
              We're sorry, but something unexpected happened. Please try again.
            </Text>
          </div>
          <Button
            onClick={this.handleRetry}
            label={<Text color="white">Try Again</Text>}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
