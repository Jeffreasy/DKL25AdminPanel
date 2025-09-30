import React from 'react'
import { cc } from '../../../styles/shared'

interface PhotoErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface PhotoErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class PhotoErrorBoundary extends React.Component<PhotoErrorBoundaryProps, PhotoErrorBoundaryState> {
  constructor(props: PhotoErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): PhotoErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Photo component error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error?: Error
  resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: DefaultErrorFallbackProps) {
  return (
    <div className={cc.card({ className: 'p-6 text-center' })}>
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Er ging iets mis met het laden van de foto's
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {error?.message || 'Er is een onverwachte fout opgetreden.'}
      </p>
      <button
        onClick={resetError}
        className={cc.button.base({ color: 'primary' })}
      >
        Opnieuw proberen
      </button>
    </div>
  )
}

export { PhotoErrorBoundary, DefaultErrorFallback }