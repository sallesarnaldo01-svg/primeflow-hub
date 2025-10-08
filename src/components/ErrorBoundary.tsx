import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
            <p className="text-muted-foreground mb-6">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-muted p-4 rounded-lg mb-4 overflow-auto">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="mr-2"
            >
              Ir para Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
