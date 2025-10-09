import React from 'react'
import { SidebarContent } from './SidebarContent'

export function TabletSidebar() {
  return (
    <div className="hidden md:block lg:hidden bg-gray-800 dark:bg-gray-900 h-screen sticky top-0">
      <div className="w-20 h-full">
        <SidebarContent variant="tablet" />
      </div>
    </div>
  )
}