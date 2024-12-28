import { useSidebar } from '../../contexts/SidebarContext'
import { Navigation } from './Navigation'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import DKLLogo from '../../assets/DKLLogo.png'
import { componentClasses as cc } from '../../styles/shared'
import { cl } from '../../styles/shared'
import { ResizeHandle } from './ResizeHandle'

export function Sidebar() {
  const { isCollapsed, toggleCollapse, setMobileOpen } = useSidebar()

  return (
    <div className={cc.sidebar.container}>
      {/* Header */}
      <div className={cc.sidebar.header.wrapper}>
        <img
          className={cl(
            cc.sidebar.header.logo.base,
            isCollapsed ? cc.sidebar.header.logo.collapsed : cc.sidebar.header.logo.expanded
          )}
          src={DKLLogo}
          alt="DKL25 Admin"
        />
        
        <div className="flex items-center">
          {/* Mobile close button */}
          <button
            type="button"
            className={cl(cc.button.icon, 'md:hidden')}
            onClick={() => setMobileOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className={cl(cc.button.icon, 'hidden md:block')}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className={cc.sidebar.content.wrapper}>
        <Navigation />
      </div>

      {/* Resize Handle */}
      <ResizeHandle />
    </div>
  )
} 