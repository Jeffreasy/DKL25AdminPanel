import React from 'react'
import { useSidebar } from '../../../contexts/SidebarContext' // Adjusted path
import { MobileSidebar } from './MobileSidebar'
import { TabletSidebar } from './TabletSidebar'
import { DesktopSidebar } from './DesktopSidebar'

// This component acts as the main entry point for the Sidebar.
// It uses the context to get the state and renders the appropriate
// mobile, tablet, or desktop version, passing down the necessary props.
export function Sidebar() {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebar()

  return (
    <>
      {/* Render the Mobile Sidebar component */}
      <MobileSidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />

      {/* Render the Tablet Sidebar component */}
      <TabletSidebar />

      {/* Render the Desktop Sidebar component */}
      <DesktopSidebar isCollapsed={isCollapsed} />
    </>
  )
} 