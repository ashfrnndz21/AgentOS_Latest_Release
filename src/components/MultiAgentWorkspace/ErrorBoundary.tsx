import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Simple ErrorBoundary class component
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Strands Workflow Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900/20 to-orange-900/20">
          <div className="max-w-md mx-auto p-6 bg-slate-800/90 border border-red-500/30 rounded-lg shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Canvas Rendering Error</h2>
            </div>
            
            <div className="text-sm text-slate-300 mb-4">
              <p className="mb-2">The Strands Intelligence workspace encountered an error while rendering the canvas.</p>
              <p className="mb-3">This usually happens during query execution completion when state updates conflict.</p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-3 bg-slate-900/50 rounded border border-slate-600">
                <summary className="text-sm text-slate-400 cursor-pointer mb-2">Error Details (Development)</summary>
                <div className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2 text-slate-400">{this.state.errorInfo.componentStack}</div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Canvas
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              If this error persists, please check the browser console for more details.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
