import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapse: () => void
  customWidth: number
  setCustomWidth: (width: number) => void
  isMobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  isResizing: boolean
  startResizing: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const DEFAULT_SIDEBAR_WIDTH = 280 // pixels

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [customWidth, setCustomWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [isMobileOpen, setMobileOpen] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev)
    setCustomWidth(DEFAULT_SIDEBAR_WIDTH)
  }

  const startResizing = useCallback(() => {
    setIsResizing(true)
    document.body.style.cursor = 'ew-resize'
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(400, e.clientX))
      setCustomWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      toggleCollapse, 
      customWidth, 
      setCustomWidth,
      isMobileOpen,
      setMobileOpen,
      isResizing,
      startResizing
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