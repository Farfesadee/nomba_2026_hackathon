"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

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

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center max-w-md p-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <Link
                href="/"
                className="text-sm text-primary underline underline-offset-4"
                onClick={() => this.setState({ hasError: false, error: undefined })}
              >
                Go Home
              </Link>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
