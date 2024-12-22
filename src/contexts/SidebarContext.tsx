import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapse: () => void
  customWidth: number | null
  setCustomWidth: (width: number | null) => void
  // Mobile navigation
  isMobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const DEFAULT_SIDEBAR_WIDTH = 280 // pixels

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [customWidth, setCustomWidth] = useState<number | null>(null)
  const [isMobileOpen, setMobileOpen] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev)
    setCustomWidth(null) // Reset custom width when toggling collapse
  }

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      toggleCollapse, 
      customWidth, 
      setCustomWidth,
      isMobileOpen,
      setMobileOpen
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export { DEFAULT_SIDEBAR_WIDTH } 