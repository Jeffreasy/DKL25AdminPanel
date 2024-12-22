export interface SubMenuItem {
  name: string
  href: string
  title: string
  badge?: {
    text: string
    color: string
  }
}

export interface MenuItem {
  name: string
  href?: string
  title?: string
  icon: React.ComponentType<React.ComponentProps<'svg'>>
  isGroup?: boolean
  badge?: {
    text: string
    color: string
  }
  submenu?: SubMenuItem[]
} 