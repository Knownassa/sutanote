import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<Props, BoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error) {
    console.error("[CanvasErrorBoundary]", error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background p-8 text-center">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-sm font-medium text-destructive">Canvas failed to render</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {this.state.error?.message ?? "Unknown error"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-popover px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
