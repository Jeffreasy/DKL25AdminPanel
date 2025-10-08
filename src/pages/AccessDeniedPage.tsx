import { useNavigate } from 'react-router-dom'
import { cc } from '../styles/shared'
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Geen Toegang
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Je hebt geen toestemming om deze pagina te bekijken.
            Neem contact op met een beheerder als je denkt dat dit een fout is.
          </p>
          
          <button
            onClick={() => navigate(-1)}
            className={cc.button.base({ color: 'primary', className: 'gap-2' })}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Ga Terug
          </button>
        </div>
      </div>
    </div>
  )
}