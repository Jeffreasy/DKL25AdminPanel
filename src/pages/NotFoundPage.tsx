import { Link } from 'react-router-dom'
import { cc } from '../styles/shared'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Pagina niet gevonden</p>
        <Link 
          to="/" 
          className={cc.button.base({ color: 'primary', className: "mt-4 inline-block" })}
        >
          Terug naar Dashboard
        </Link>
      </div>
    </div>
  )
} 