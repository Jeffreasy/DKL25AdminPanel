export interface SubMenuItem {
  name: string
  path: string
  label: string
  badge?: {
    text: string
    color: string
  }
}

export interface MenuItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  label: string
} 