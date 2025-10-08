import React, { Component, ReactNode } from 'react'
import { cc } from '../../../styles/shared'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Albums Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Er is iets misgegaan
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">
              Er is een fout opgetreden bij het laden van de albums.
            </p>
            <button
              onClick={() => window.location.reload()}
              className={cc.button.base({ color: 'danger' })}
            >
              Pagina herladen
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-red-700 dark:text-red-300">
                  Technische details
                </summary>
                <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}