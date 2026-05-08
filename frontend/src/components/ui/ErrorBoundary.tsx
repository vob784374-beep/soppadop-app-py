import { Component, ReactNode } from 'react'
import Card from './Card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-enter" style={{ maxWidth: 500, margin: '100px auto', padding: '0 1rem' }}>
          <Card title="Something went wrong">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{this.state.error?.message}</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button onClick={() => this.setState({ hasError: false, error: null })} style={{
                  padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff',
                  borderRadius: '4px', border: 'none', cursor: 'pointer',
                }}>
                  Try Again
                </button>
                <a href="/admin/dashboard" style={{
                  padding: '0.5rem 1rem', background: '#e5e7eb', color: '#374151',
                  borderRadius: '4px', textDecoration: 'none',
                }}>
                  Go Home
                </a>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
