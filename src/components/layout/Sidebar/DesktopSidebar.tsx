import React from 'react'
import { SidebarContent } from './SidebarContent'

interface DesktopSidebarProps {
  isCollapsed: boolean;
}

export function DesktopSidebar({ isCollapsed }: DesktopSidebarProps) {
  return (
    // Changed background color to always be bg-gray-800
    <div className="hidden lg:block bg-gray-800 h-screen sticky top-0">
      {/* Inner container that handles width transition */}
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 h-full`}>
        {/* Render SidebarContent, passing the collapsed state and variant="desktop" */}
        {/* No onClose needed for desktop */}
        <SidebarContent variant="desktop" isCollapsed={isCollapsed} />
      </div>
    </div>
  )
} 