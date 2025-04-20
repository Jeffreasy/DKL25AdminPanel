import React from 'react'
import { Link } from 'react-router-dom'
import { menuItems, MenuItem, MenuGroup, MenuItemOrGroup } from '../../../types/navigation'
import { FavoritePages } from '../FavoritePages'
import { RecentPages } from '../RecentPages'

interface SidebarContentProps {
  variant: 'mobile' | 'tablet' | 'desktop';
  isCollapsed?: boolean;
  onClose?: () => void;
}

export function SidebarContent({ variant, isCollapsed = false, onClose }: SidebarContentProps) {
  // Determine logo size based on variant and collapsed state
  const logoSizeClass =
    variant === 'mobile' ? 'w-24'
    : variant === 'tablet' ? 'w-24'
    : isCollapsed ? 'w-8'
    : 'w-32';

  // Apply white background wrapper for both mobile and tablet
  const useWrapper = variant === 'mobile' || variant === 'tablet';

  // Determine if optional sections should be shown
  const showOptionalSections = variant === 'desktop' && !isCollapsed;

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header (Logo) */}
      <div className={`flex items-center justify-between flex-shrink-0 ${useWrapper ? 'px-4 pt-4 pb-2' : 'px-4 py-3'}`}> {/* Adjust padding for mobile wrapper */}
        <div className={`${useWrapper ? 'bg-white p-2 rounded-md inline-block' : ''}`}> 
          <img
            src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png"
            alt="Logo"
            // Removed filter, apply size class.
            className={`block transition-all duration-300 ${logoSizeClass}`}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-grow space-y-1 px-2 py-4">
        {menuItems.map((item: MenuItemOrGroup) =>
          'items' in item ? (
            <div key={item.label} className="space-y-1">
              {!isCollapsed && variant !== 'mobile' && variant !== 'tablet' && (
                <span className="block px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{item.label}</span>
              )}
              <div className={!isCollapsed && variant === 'desktop' ? 'ml-0' : ''}>
                {(item as MenuGroup).items.map((subItem: MenuItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    title={subItem.label}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-300 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white group"
                    onClick={onClose}
                  >
                    <subItem.icon className={`
                      flex-shrink-0 h-6 w-6
                      transition-colors duration-200
                      text-gray-400 dark:text-gray-500 group-hover:text-white dark:group-hover:text-gray-300
                      ${variant === 'tablet' || (variant === 'desktop' && isCollapsed) ? 'mx-auto' : 'mr-3'}
                    `} />
                    {variant !== 'tablet' && !(variant === 'desktop' && isCollapsed) && <span>{subItem.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-300 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white group"
              onClick={onClose}
            >
              <item.icon className={`
                flex-shrink-0 h-6 w-6
                transition-colors duration-200
                text-gray-400 dark:text-gray-500 group-hover:text-white dark:group-hover:text-gray-300
                ${variant === 'tablet' || (variant === 'desktop' && isCollapsed) ? 'mx-auto' : 'mr-3'}
              `} />
              {variant !== 'tablet' && !(variant === 'desktop' && isCollapsed) && <span>{item.label}</span>}
            </Link>
          )
        )}
      </nav>

      {/* Divider and Optional Sections - Now based on showOptionalSections flag */}
      {showOptionalSections && (
        <div className="px-2 py-4 flex-shrink-0">
          <hr className="my-4 border-gray-600 dark:border-gray-700" />
          <FavoritePages />
          <RecentPages />
        </div>
      )}
    </div>
  )
} 