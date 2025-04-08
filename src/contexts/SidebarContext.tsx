import { createContext, useContext, useState } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  isMobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleCollapse: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobileOpen: false,
  setMobileOpen: () => {},
  toggleCollapse: () => {}
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setMobileOpen] = useState(false)

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isMobileOpen,
      setMobileOpen,
      toggleCollapse
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
} 