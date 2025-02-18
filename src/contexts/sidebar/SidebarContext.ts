import { createContext } from 'react'

export interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

export const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {}
}) 