import React from 'react'
import { SidebarContent } from './SidebarContent'

// No props needed currently, as it's always collapsed
interface TabletSidebarProps {}

export function TabletSidebar({}: TabletSidebarProps) {
  return (
    // Changed background color to always be bg-gray-800
    <div className="hidden md:block lg:hidden bg-gray-800 h-screen sticky top-0">
      {/* Fixed width container for the collapsed state */}
      <div className="w-20 h-full">
        {/* Render SidebarContent, always passing isCollapsed={true} */}
        <SidebarContent variant="tablet" />
      </div>
    </div>
  )
} 