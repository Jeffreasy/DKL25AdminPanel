import { 
  HomeIcon, 
  PhotoIcon, 
  FolderIcon,
  VideoCameraIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import type { ComponentType } from 'react'

export interface MenuItem {
  name: string
  path: string
  icon: ComponentType<{ className?: string }>
  label: string
}

export interface NavigationItem {
  name: string
  href: string
  icon: ComponentType<{ className?: string }>
}

export const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon
  },
  {
    name: "Foto's",
    href: '/photos',
    icon: PhotoIcon
  },
  {
    name: 'Albums',
    href: '/albums',
    icon: FolderIcon
  },
  {
    name: "Video's",
    href: '/videos',
    icon: VideoCameraIcon
  },
  {
    name: 'Partners',
    href: '/partners',
    icon: UserGroupIcon
  },
  {
    name: 'Sponsors',
    href: '/sponsors',
    icon: CurrencyDollarIcon
  }
]

// Navigation items voor de Navigation component
export const menuItems: MenuItem[] = navigation.map(item => ({
  name: item.name,
  path: item.href,
  icon: item.icon,
  label: item.name
})) 