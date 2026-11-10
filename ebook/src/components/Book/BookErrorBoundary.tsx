import { Component, type ReactNode } from 'react'

type Props = { fallback: ReactNode; children: ReactNode; onError?: (e: unknown) => void }

/** If the page-turning engine fails, the reader falls back to the list view. */
export class BookErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Flipbook failed; showing list view instead.', error)
    this.props.onError?.(error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
