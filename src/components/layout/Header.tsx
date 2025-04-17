import { UserMenu } from './UserMenu'
import { SearchBar } from './SearchBar'
import { QuickActions } from './QuickActions'

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <SearchBar />
        <div className="flex items-center space-x-4">
          <QuickActions />
          <UserMenu />
        </div>
      </div>
    </header>
  )
} 