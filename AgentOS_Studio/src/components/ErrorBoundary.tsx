import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h2 className="text-xl font-semibold mb-2">Error Details:</h2>
              <pre className="text-red-300 text-sm overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </div>
            {this.state.errorInfo && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Component Stack:</h2>
                <pre className="text-gray-300 text-sm overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}