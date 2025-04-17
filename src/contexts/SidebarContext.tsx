import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  isMobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleCollapse: () => void
  setIsCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobileOpen: false,
  setMobileOpen: () => {},
  toggleCollapse: () => {},
  setIsCollapsed: () => {}
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setMobileOpen] = useState(false)

  const toggleCollapse = () => setIsCollapsed((prev) => !prev)

  const checkTabletSize = useCallback(() => {
    const screenWidth = window.innerWidth
    const isTablet = screenWidth >= 768 && screenWidth < 1024
    setIsCollapsed(isTablet)
  }, [setIsCollapsed])

  useEffect(() => {
    checkTabletSize()

    window.addEventListener('resize', checkTabletSize)

    return () => window.removeEventListener('resize', checkTabletSize)
  }, [checkTabletSize])

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isMobileOpen,
      setMobileOpen,
      toggleCollapse,
      setIsCollapsed
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