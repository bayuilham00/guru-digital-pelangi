import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@heroui/react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Terjadi Kesalahan</h2>
            <p className="text-white/60 text-sm mb-6">
              Aplikasi mengalami error tak terduga. Silakan muat ulang halaman atau coba lagi nanti.
            </p>
            <div className="space-y-3">
              <Button
                color="primary"
                variant="shadow"
                onPress={() => window.location.reload()}
                startContent={<RefreshCcw className="w-4 h-4" />}
                className="w-full"
              >
                Muat Ulang Halaman
              </Button>
              <Button
                variant="ghost"
                onPress={() => this.setState({ hasError: false, error: undefined })}
                className="w-full text-white/60"
              >
                Coba Lagi
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-white/60 text-xs cursor-pointer">Error Details (Development)</summary>
                <pre className="text-red-300 text-xs mt-2 p-2 bg-black/20 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Unhandled error:', error, errorInfo);
    // You could also send this to an error reporting service
  };
};
