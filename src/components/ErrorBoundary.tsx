import { Component, ErrorInfo, ReactNode } from 'react'
import { componentClasses as cc } from '../styles/shared'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="max-w-max mx-auto">
            <main className="sm:flex">
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 sm:text-5xl">Error</p>
              <div className="sm:ml-6">
                <div className="sm:border-l sm:border-gray-200 dark:sm:border-gray-700 sm:pl-6">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight sm:text-5xl">
                    Er is iets misgegaan
                  </h1>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    {this.state.error?.message || 'Probeer de pagina te verversen'}
                  </p>
                </div>
                <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                  <button
                    onClick={() => window.location.reload()}
                    className={cc.button.primary}
                  >
                    Ververs pagina
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 