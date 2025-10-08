import React from 'react'
import { SidebarContent } from './SidebarContent'

interface TabletSidebarProps {}

export function TabletSidebar({}: TabletSidebarProps) {
  return (
    <div className="hidden md:block lg:hidden bg-gray-800 dark:bg-gray-900 h-screen sticky top-0">
      <div className="w-20 h-full">
        <SidebarContent variant="tablet" />
      </div>
    </div>
  )
}