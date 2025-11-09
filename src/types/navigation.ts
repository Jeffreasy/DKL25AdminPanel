import {
  HomeIcon,
  FilmIcon,
  VideoCameraIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  InboxIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType } from 'react'

export interface MenuItem {
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
  permission?: string // RBAC permission required to access this menu item
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
    // Dashboard accessible to all authenticated users
  },
  {
    label: 'Media',
    path: '/media',
    icon: FilmIcon,
    permission: 'photo:read',
  },
  {
    label: "Video's",
    path: '/videos',
    icon: VideoCameraIcon,
    permission: 'video:read',
  },
  {
    label: 'Relaties',
    items: [
      { label: 'Partners', path: '/partners', icon: UserGroupIcon, permission: 'partner:read' },
      { label: 'Sponsors', path: '/sponsors', icon: CurrencyDollarIcon, permission: 'sponsor:read' },
    ]
  },
  { label: 'Nieuwsbrieven', path: '/newsletters', icon: EnvelopeIcon, permission: 'newsletter:read' },
  { label: 'Email', path: '/email', icon: InboxIcon, permission: 'email:read' },
  { label: 'Notulen', path: '/notulen', icon: DocumentTextIcon, permission: 'notulen:read' },
  { label: 'Gebruikers', path: '/users', icon: UserGroupIcon, permission: 'user:read' },
  { label: 'Admin', path: '/admin', icon: ShieldCheckIcon, permission: 'admin:access' },
  {
    label: 'Frontend',
    path: '/frontend',
    icon: GlobeAltIcon,
    // Frontend accessible to all authenticated users
  }
]
