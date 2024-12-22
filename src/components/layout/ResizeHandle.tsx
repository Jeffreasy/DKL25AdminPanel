import { useEffect, useRef, useState } from 'react'
import { useSidebar } from '../../contexts/SidebarContext'

const MIN_WIDTH = 200 // Minimum sidebar width
const MAX_WIDTH = 400 // Maximum sidebar width

export function ResizeHandle() {
  const { setCustomWidth } = useSidebar()
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(288) // Default width (w-72 = 18rem = 288px)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const diff = e.clientX - startXRef.current
      const newWidth = Math.min(Math.max(startWidthRef.current + diff, MIN_WIDTH), MAX_WIDTH)
      setCustomWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, setCustomWidth])

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    startXRef.current = e.clientX
    setIsResizing(true)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-indigo-500/50 transition-colors"
      onMouseDown={startResizing}
    >
      <div className="absolute inset-y-0 right-0 w-4 -mr-2" />
    </div>
  )
} 