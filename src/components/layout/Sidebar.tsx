import { useSidebar } from '../../contexts/SidebarContext'
import { Navigation } from './Navigation'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import DKLLogo from '../../assets/DKLLogo.png'

export function Sidebar() {
  const { isCollapsed, toggleCollapse, setMobileOpen } = useSidebar()

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header met logo en collapse/close buttons */}
      <div className="flex h-16 flex-shrink-0 items-center px-4 justify-between">
        <img
          className={`transition-all duration-300 ${
            isCollapsed ? 'w-8' : 'w-auto h-12'
          }`}
          src={DKLLogo}
          alt="DKL25 Admin"
        />
        <div className="flex items-center">
          {/* Mobile close button */}
          <button
            type="button"
            className="md:hidden -m-2.5 p-2.5 text-gray-700"
            onClick={() => setMobileOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:block p-1 rounded-md hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  )
} 