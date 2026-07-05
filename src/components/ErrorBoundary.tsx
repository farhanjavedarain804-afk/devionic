import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-destructive/5 border-2 border-destructive/20 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-destructive" size={32} />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 font-heading">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              An unexpected error occurred in this section of the dashboard. Our team has been notified.
            </p>
            
            {this.state.error && (
              <div className="bg-destructive/10 text-destructive text-[10px] font-mono p-3 rounded-lg mb-8 text-left overflow-auto max-h-32 mb-8">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="cyan" 
                className="flex-1 h-12 rounded-xl gap-2 font-bold shadow-lg shadow-accent/20"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={18} /> Reload App
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl gap-2 font-bold border-border"
                onClick={() => window.location.href = "/"}
              >
                <Home size={18} /> Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
