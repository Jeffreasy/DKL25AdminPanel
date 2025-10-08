import React from 'react'
import { SidebarContent } from './SidebarContent'
import { cc } from '../../../styles/shared'

interface DesktopSidebarProps {
  isCollapsed: boolean;
}

export function DesktopSidebar({ isCollapsed }: DesktopSidebarProps) {
  return (
    <div className="hidden lg:block bg-gray-800 dark:bg-gray-900 h-screen sticky top-0">
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} ${cc.transition.normal} h-full`}>
        <SidebarContent variant="desktop" isCollapsed={isCollapsed} />
      </div>
    </div>
  )
}