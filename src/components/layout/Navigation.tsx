import { NavLink } from 'react-router-dom'
import { 
  HomeIcon,
  PhotoIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  VideoCameraIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline'
import type { MenuItem } from '../../types/navigation'
import { componentClasses as cc } from '../../styles/shared'
import { cl } from '../../styles/shared'

const navigation: MenuItem[] = [
  { 
    name: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    label: 'Dashboard'
  },
  { 
    name: 'Photos',
    path: '/photos',
    icon: PhotoIcon,
    label: "Foto's"
  },
  {
    name: 'Albums',
    path: '/albums',
    icon: RectangleStackIcon,
    label: 'Albums'
  },
  {
    name: 'Videos',
    path: '/videos',
    icon: VideoCameraIcon,
    label: "Video's"
  },
  {
    name: 'Partners',
    path: '/partners',
    icon: UserGroupIcon,
    label: 'Partners'
  },
  {
    name: 'Sponsors',
    path: '/sponsors',
    icon: CurrencyDollarIcon,
    label: 'Sponsors'
  }
]

export function Navigation() {
  return (
    <nav className={cc.sidebar.content.section}>
      {navigation.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }: { isActive: boolean }) => cl(
            cc.sidebar.item.base,
            isActive ? cc.sidebar.item.active : cc.sidebar.item.inactive
          )}
        >
          <item.icon 
            className={cl(
              cc.sidebar.item.icon.base,
              cc.sidebar.item.icon.inactive
            )} 
          />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
} 