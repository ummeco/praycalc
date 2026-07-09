/**
 * ErrorBoundary.tsx — React error boundary for top-level hydrated islands.
 *
 * PURPOSE: Catch render/lifecycle errors thrown by an island subtree so a bug in
 *   one island (e.g. CityClient, AccountClient) degrades to a small inline
 *   message instead of leaving a blank area or crashing the whole hydrated tree.
 * INPUTS: children (the island to guard), optional fallback render + onError hook
 * OUTPUTS: children when healthy; a minimal fallback UI once an error is caught
 * CONSTRAINTS:
 *   - Class component required — React error boundaries have no hook equivalent.
 *   - No external error-reporting call baked in here; callers that want Sentry
 *     reporting pass onError and forward it themselves (keeps this dependency-free).
 *   - Fallback stays visually unobtrusive — this is a last resort, not a page.
 * REF: P2-PRAYCALC-WEB-GAPS-100
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional custom fallback; receives the caught error. */
  fallback?: (error: Error) => ReactNode;
  /** Optional side-effect hook (e.g. Sentry.captureException) run on catch. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error);

    return (
      <div role="alert" className="island-error-fallback">
        <p>Something went wrong loading this section. Try refreshing the page.</p>
      </div>
    );
  }
}
