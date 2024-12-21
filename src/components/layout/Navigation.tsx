import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  PhotoIcon,
  FilmIcon,
  UserGroupIcon,
  FolderIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: "Foto's", href: '/dashboard/photos', icon: PhotoIcon },
  { name: 'Albums', href: '/dashboard/albums', icon: FolderIcon },
  { name: "Video's", href: '/dashboard/videos', icon: FilmIcon },
  { name: 'Partners', href: '/dashboard/partners', icon: UserGroupIcon },
  { name: 'Sponsors', href: '/dashboard/sponsors', icon: CurrencyDollarIcon },
]

export function Navigation() {
  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => `
                    group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                    ${isActive
                      ? 'bg-gray-50 text-indigo-600'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon
                    className="h-6 w-6 shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  )
} 