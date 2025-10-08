import { UserMenu } from './UserMenu'
import { SearchBar } from './SearchBar'
import { QuickActions } from './QuickActions'
import { useSidebar } from '../../providers/SidebarProvider'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { cc } from '../../styles/shared'

export function Header() {
  const { setMobileOpen } = useSidebar()

  return (
    <header className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${cc.spacing.px.sm} ${cc.spacing.py.sm}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className={`md:hidden mr-3 rounded-md p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${cc.transition.colors}`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="hidden sm:block">
            <SearchBar />
          </div>
        </div>

        <div className={`flex items-center ${cc.spacing.gap.lg}`}>
          <QuickActions />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}