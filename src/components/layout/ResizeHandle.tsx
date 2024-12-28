import { useSidebar } from '../../contexts/SidebarContext'
import { componentClasses as cc } from '../../styles/shared'
import { cl } from '../../styles/shared'

export function ResizeHandle() {
  const { isResizing, startResizing } = useSidebar()
  
  return (
    <div 
      className={cl(
        cc.sidebar.resize.handle,
        isResizing && cc.sidebar.resize.active
      )}
      onMouseDown={startResizing}
    />
  )
} 