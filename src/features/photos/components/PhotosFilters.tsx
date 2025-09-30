import { ViewColumnsIcon, ListBulletIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../styles/shared'

interface PhotosFiltersProps {
  activeTab: 'all' | 'unorganized'
  onTabChange: (tab: 'all' | 'unorganized') => void
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
  searchQuery: string
  onSearchChange: (query: string) => void
  unorganizedCount: number
}

export function PhotosFilters({
  activeTab,
  onTabChange,
  view,
  onViewChange,
  searchQuery,
  onSearchChange,
  unorganizedCount
}: PhotosFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="flex border-b border-gray-200 dark:border-gray-700 w-full md:w-auto overflow-x-auto">
        <button
          onClick={() => onTabChange('all')}
          className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${
            activeTab === 'all'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Alle Foto's
        </button>
        <button
          onClick={() => onTabChange('unorganized')}
          className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${
            activeTab === 'unorganized'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Niet Georganiseerd ({unorganizedCount})
        </button>
      </div>

      <div className="hidden md:flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-grow md:flex-grow-0">
          <input
            type="search"
            placeholder="Zoek foto's & albums..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className={cc.form.input({ className: 'pl-10' })}
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center rounded-md bg-gray-100 dark:bg-gray-700 p-0.5">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-1.5 rounded ${
              view === 'grid'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Grid weergave"
          >
            <ViewColumnsIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-1.5 rounded ${
              view === 'list'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Lijst weergave"
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}