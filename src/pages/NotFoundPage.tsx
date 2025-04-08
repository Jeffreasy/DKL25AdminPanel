import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-600">Pagina niet gevonden</p>
        <Link 
          to="/" 
          className="mt-4 inline-block px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Terug naar Dashboard
        </Link>
      </div>
    </div>
  )
} 