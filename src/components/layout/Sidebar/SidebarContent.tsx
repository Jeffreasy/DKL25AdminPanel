import React from 'react'
import { Link } from 'react-router-dom'
import { menuItems, MenuItem, MenuGroup, MenuItemOrGroup } from '../../../types/navigation'
import { FavoritePages } from '../FavoritePages'
import { RecentPages } from '../RecentPages'
import { usePermissions } from '../../../hooks/usePermissions'
import { cc } from '../../../styles/shared'

interface SidebarContentProps {
  variant: 'mobile' | 'tablet' | 'desktop';
  isCollapsed?: boolean;
  onClose?: () => void;
}

export function SidebarContent({ variant, isCollapsed = false, onClose }: SidebarContentProps) {
  const { hasPermission } = usePermissions();

  // Check if user has staff access (for fallback read permissions)
  const hasStaffAccess = hasPermission('staff', 'access');

  const filterMenuItems = (items: MenuItemOrGroup[]): MenuItemOrGroup[] => {
    return items
      .map(item => {
        if ('items' in item) {
          const filteredItems = item.items.filter(subItem => {
            if (!subItem.permission) return true;
            
            const [resource, action] = subItem.permission.split(':');
            
            // Check specific permission OR staff access for read-only items
            if (action === 'read' && hasStaffAccess) {
              return true; // Staff gets all read permissions
            }
            
            return hasPermission(resource, action);
          });
          return filteredItems.length > 0 ? { ...item, items: filteredItems } : null;
        } else {
          if (!item.permission) return item;
          
          const [resource, action] = item.permission.split(':');
          
          // Check specific permission OR staff access for read-only items
          if (action === 'read' && hasStaffAccess) {
            return item; // Staff gets all read permissions
          }
          
          return hasPermission(resource, action) ? item : null;
        }
      })
      .filter((item): item is MenuItemOrGroup => item !== null);
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  const logoSizeClass =
    variant === 'mobile' ? 'w-24'
    : variant === 'tablet' ? 'w-24'
    : isCollapsed ? 'w-8'
    : 'w-32';

  const useWrapper = variant === 'mobile' || variant === 'tablet';
  const showOptionalSections = variant === 'desktop' && !isCollapsed;

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header (Logo) */}
      <div className={`flex items-center justify-between flex-shrink-0 ${useWrapper ? `${cc.spacing.px.sm} pt-4 pb-2` : `${cc.spacing.px.sm} ${cc.spacing.py.md}`}`}>
        <div className={`${useWrapper ? 'bg-white dark:bg-white p-2 rounded-md inline-block' : ''}`}>
          <img
            src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png"
            alt="Logo"
            className={`block ${cc.transition.normal} ${logoSizeClass}`}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`flex-grow ${cc.spacing.section.xs} px-2 ${cc.spacing.py.sm}`}>
        {filteredMenuItems.map((item: MenuItemOrGroup) =>
          'items' in item ? (
            <div key={item.label} className={cc.spacing.section.xs}>
              {!isCollapsed && variant !== 'mobile' && variant !== 'tablet' && (
                <span className="block px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {item.label}
                </span>
              )}
              <div className={!isCollapsed && variant === 'desktop' ? 'ml-0' : ''}>
                {(item as MenuGroup).items.map((subItem: MenuItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    title={subItem.label}
                    className={`flex items-center px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-300 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white group ${cc.transition.colors}`}
                    onClick={onClose}
                  >
                    <subItem.icon className={`
                      flex-shrink-0 h-6 w-6
                      ${cc.transition.colors}
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
              className={`flex items-center px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-300 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white group ${cc.transition.colors}`}
              onClick={onClose}
            >
              <item.icon className={`
                flex-shrink-0 h-6 w-6
                ${cc.transition.colors}
                text-gray-400 dark:text-gray-500 group-hover:text-white dark:group-hover:text-gray-300
                ${variant === 'tablet' || (variant === 'desktop' && isCollapsed) ? 'mx-auto' : 'mr-3'}
              `} />
              {variant !== 'tablet' && !(variant === 'desktop' && isCollapsed) && <span>{item.label}</span>}
            </Link>
          )
        )}
      </nav>

      {/* Divider and Optional Sections */}
      {showOptionalSections && (
        <div className={`px-2 ${cc.spacing.py.sm} flex-shrink-0`}>
          <hr className="my-4 border-gray-600 dark:border-gray-700" />
          <FavoritePages />
          <RecentPages />
        </div>
      )}
    </div>
  )
}