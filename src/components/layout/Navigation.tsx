import { HomeIcon, UsersIcon, PhotoIcon, FolderIcon, FilmIcon } from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
import { classNames } from '../../utils/classNames'

interface NavigationProps {
  onNavigate?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Partners', href: '/dashboard/partners', icon: UsersIcon },
  { name: 'Foto\'s', href: '/dashboard/photos', icon: PhotoIcon },
  { name: 'Albums', href: '/dashboard/albums', icon: FolderIcon },
  { name: 'Video\'s', href: '/dashboard/videos', icon: FilmIcon },
]

export function Navigation({ onNavigate }: NavigationProps) {
  return (
    <nav className="flex-1 space-y-1 px-2">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            classNames(
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )
          }
        >
          <item.icon
            className={classNames(
              'text-gray-400 group-hover:text-gray-500',
              'mr-3 h-6 w-6'
            )}
            aria-hidden="true"
          />
          {item.name}
        </NavLink>
      ))}
    </nav>
  )
} 