import { Link } from 'react-router-dom'
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext'
import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline'

export function RecentPages() {
  const { recentPages, clearHistory } = useNavigationHistory()

  if (recentPages.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between px-3 mb-2">
        <div className="flex items-center text-sm font-medium text-gray-500">
          <ClockIcon className="h-5 w-5 mr-2" />
          Recent bezocht
        </div>
        {recentPages.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-500"
            title="Geschiedenis wissen"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="space-y-1">
        {recentPages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
          >
            <span className="truncate">{page.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
} 