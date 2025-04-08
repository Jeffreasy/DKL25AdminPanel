import { useSidebar } from '../../contexts/SidebarContext'
import { menuItems } from '../../types/navigation'
import { Link } from 'react-router-dom'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { Transition } from '@headlessui/react'
import { Fragment } from 'react'

export function Sidebar() {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebar()

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 rounded-md bg-[#1B2B3A] p-2 text-gray-200 hover:bg-gray-700"
        onClick={() => setMobileOpen(!isMobileOpen)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        {/* Backdrop */}
        <Transition
          as={Fragment}
          show={isMobileOpen}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setMobileOpen(false)}
          />
        </Transition>

        {/* Mobile Sidebar Content */}
        <Transition
          as={Fragment}
          show={isMobileOpen}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="relative flex-1 flex flex-col w-full max-w-xs bg-[#1B2B3A]">
              <SidebarContent isCollapsed={false} onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </Transition>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block bg-[#1B2B3A] h-screen sticky top-0">
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
          <SidebarContent isCollapsed={isCollapsed} />
        </div>
      </div>
    </>
  )
}

// Separate component for sidebar content to avoid duplication
function SidebarContent({ isCollapsed, onClose }: { isCollapsed: boolean, onClose?: () => void }) {
  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <img 
          src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png" 
          alt="Logo" 
          className={`transition-all duration-300 ${isCollapsed ? 'w-8' : 'w-32'}`}
        />
        
        {onClose && (
          <button
            type="button"
            className="md:hidden rounded-md text-gray-200 hover:bg-gray-700 p-2"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {menuItems.map(item => 
          'items' in item ? (
            <div key={item.label} className="space-y-1">
              <span className="text-gray-500">{item.label}</span>
              <div className="ml-4">
                {item.items.map(subItem => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white group"
                    onClick={onClose}
                  >
                    <subItem.icon className={`
                      flex-shrink-0 h-6 w-6
                      transition-colors duration-200
                      text-gray-400 group-hover:text-white
                      ${isCollapsed ? 'mx-auto' : 'mr-3'}
                    `} />
                    {!isCollapsed && <span>{subItem.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white group"
              onClick={onClose}
            >
              <item.icon className={`
                flex-shrink-0 h-6 w-6
                transition-colors duration-200
                text-gray-400 group-hover:text-white
                ${isCollapsed ? 'mx-auto' : 'mr-3'}
              `} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        )}
      </nav>
    </div>
  )
} 