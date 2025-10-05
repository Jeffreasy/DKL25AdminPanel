import {
  HomeIcon,
  PhotoIcon,
  FolderIcon,
  VideoCameraIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType } from 'react'

export interface MenuItem {
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
}

export interface MenuGroup {
  label: string
  items: MenuItem[]
}

export type MenuItemOrGroup = MenuItem | MenuGroup

export const menuItems: MenuItemOrGroup[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
  },
  {
    label: 'Media',
    items: [
      { label: "Foto's", path: '/photos', icon: PhotoIcon },
      { label: 'Albums', path: '/albums', icon: FolderIcon },
      { label: "Video's", path: '/videos', icon: VideoCameraIcon },
    ]
  },
  {
    label: 'Relaties',
    items: [
      { label: 'Partners', path: '/partners', icon: UserGroupIcon },
      { label: 'Sponsors', path: '/sponsors', icon: CurrencyDollarIcon },
    ]
  },
  { label: 'Gebruikers', path: '/users', icon: UserGroupIcon },
  {
    label: 'Frontend',
    path: '/frontend',
    icon: GlobeAltIcon,
  }
]
