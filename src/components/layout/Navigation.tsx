import { useState, useEffect } from 'react'
import { NavigationSkeleton } from './NavigationSkeleton'
import { NavLink } from 'react-router-dom'
import { Tooltip } from '@mantine/core'
import {
  HomeIcon,
  PhotoIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { RecentPages } from './RecentPages'
import { FavoritePages } from './FavoritePages'
import { ContextMenu, type ContextMenuItem } from '../common/ContextMenu'
import { useFavorites } from '../../contexts/FavoritesContext'
import { MenuItem, SubMenuItem } from '../../types/navigation'

const navigation: MenuItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon,
    title: 'Dashboard'
  },
  { 
    name: "Media", 
    icon: PhotoIcon,
    isGroup: true,
    submenu: [
      { 
        name: "Foto's", 
        href: '/photos',
        title: "Foto's beheren",
        badge: {
          text: 'Nieuw',
          color: 'bg-green-500'
        }
      },
      { 
        name: 'Albums', 
        href: '/albums',
        title: 'Albums beheren'
      },
      { 
        name: "Video's", 
        href: '/videos',
        title: "Video's beheren"
      }
    ]
  },
  { 
    name: 'Partners', 
    href: '/partners', 
    icon: UserGroupIcon,
    title: 'Partners beheren'
  },
  { 
    name: 'Sponsors', 
    href: '/sponsors', 
    icon: CurrencyDollarIcon,
    title: 'Sponsors beheren'
  }
]

export function Navigation() {
  const [isLoading, setIsLoading] = useState(true)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  // Keyboard navigatie
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        // Alt + nummer voor snelle navigatie
        const num = parseInt(e.key)
        if (!isNaN(num) && num > 0 && num <= navigation.length) {
          const item = navigation[num - 1]
          if (item.submenu) {
            // Open submenu als die bestaat
            const submenuButton = document.querySelector(`[data-menu-id="${item.name}"]`)
            if (submenuButton instanceof HTMLElement) {
              submenuButton.click()
            }
          } else if (item.href) {
            // Navigeer direct naar de pagina
            window.location.href = item.href
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Simuleer loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const getContextMenuItems = (item: MenuItem | SubMenuItem): ContextMenuItem[] => {
    // Type guard functie om te checken of href bestaat
    const hasValidHref = (item: MenuItem | SubMenuItem): item is (MenuItem | SubMenuItem) & { href: string } => {
      return typeof item.href === 'string'
    }

    if (!hasValidHref(item)) return []

    return [
      {
        label: isFavorite(item.href) ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten',
        icon: StarIcon,
        onClick: () => {
          if (isFavorite(item.href)) {
            removeFavorite(item.href)
          } else {
            addFavorite({
              name: item.name,
              path: item.href,
              icon: ('icon' in item ? item.icon.name : PhotoIcon.name)
            })
          }
        }
      },
      {
        label: 'Open in nieuw tabblad',
        icon: ArrowTopRightOnSquareIcon,
        onClick: () => window.open(item.href, '_blank')
      },
      { divider: true, label: '' },
      {
        label: 'Verwijderen',
        icon: TrashIcon,
        onClick: () => {
          // Implementeer verwijder logica
        },
        danger: true
      }
    ]
  }

  const handleGroupClick = (groupName: string) => {
    setOpenGroup(openGroup === groupName ? null : groupName)
  }

  if (isLoading) {
    return <NavigationSkeleton />
  }

  return (
    <nav className="flex-1 space-y-1 px-2 py-4 min-h-0 overflow-y-auto">
      <div className="space-y-1">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.isGroup ? (
              // Group Header - verbeterde mobiele styling
              <button
                onClick={() => handleGroupClick(item.name)}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                data-menu-id={item.name}
              >
                <item.icon
                  className="mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{item.name}</span>
                <svg
                  className={`ml-2 h-4 w-4 sm:h-5 sm:w-5 transform transition-transform duration-200 flex-shrink-0 ${
                    openGroup === item.name ? 'rotate-90' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              // Regular Nav Item - verbeterde mobiele styling
              item.href && (
                <ContextMenu items={getContextMenuItems(item)}>
                  <Tooltip label={item.name} position="right" withArrow disabled={window.innerWidth < 640}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) => `
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md
                        ${isActive
                          ? 'bg-gray-100 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${
                              isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  </Tooltip>
                </ContextMenu>
              )
            )}

            {/* Submenu - verbeterde mobiele styling */}
            {item.submenu && (
              <div
                className={`ml-6 sm:ml-8 mt-1 space-y-1 transition-all duration-200 ${
                  openGroup === item.name ? 'block' : 'hidden'
                }`}
              >
                {item.submenu.map((subItem) => (
                  <ContextMenu
                    key={subItem.name}
                    items={getContextMenuItems(subItem)}
                  >
                    <NavLink
                      to={subItem.href}
                      className={({ isActive }) => `
                        group flex items-center justify-between px-2 py-1.5 sm:py-2 text-sm font-medium rounded-md
                        ${isActive
                          ? 'bg-gray-100 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                      `}
                    >
                      <span className="truncate">{subItem.name}</span>
                      {subItem.badge && (
                        <span className={`ml-2 px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-full ${subItem.badge.color} text-white flex-shrink-0`}>
                          {subItem.badge.text}
                        </span>
                      )}
                    </NavLink>
                  </ContextMenu>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <FavoritePages />
        <RecentPages />
      </div>
    </nav>
  )
} 