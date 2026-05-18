import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#0a0a0a',
            color: '#f0ede6',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(240,237,230,.6)', marginBottom: 20 }}>
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: '#c8ff00',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '.14em',
                cursor: 'pointer',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
