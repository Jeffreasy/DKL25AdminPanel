import { Link } from 'react-router-dom'
import { useNavigationHistory } from '../../features/navigation'
import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline'
import { cc } from '../../styles/shared'

export function RecentPages() {
  const { recentPages, clearHistory } = useNavigationHistory()

  if (recentPages.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center text-sm font-medium text-gray-400 dark:text-gray-500">
          <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
          Recent bezocht
        </div>
        {recentPages.length > 0 && (
          <button
            onClick={clearHistory}
            className={`${cc.button.icon({ color: 'secondary', size: 'sm' })} hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-200 dark:hover:text-gray-300`}
            title="Geschiedenis wissen"
            aria-label="Geschiedenis wissen"
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <nav className={`${cc.spacing.section.xs} px-2`}>
        {recentPages.map((page: { path: string; title: string }) => (
          <Link
            key={page.path}
            to={page.path}
            className={`group flex items-center px-2 py-2 text-sm font-medium text-gray-300 dark:text-gray-300 rounded-md hover:text-white dark:hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800 ${cc.transition.colors}`}
          >
            <span className="truncate">{page.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}