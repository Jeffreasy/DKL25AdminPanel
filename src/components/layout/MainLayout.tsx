import { useSidebar } from '../../contexts/SidebarContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ResizeHandle } from './ResizeHandle'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { 
    isCollapsed, 
    customWidth, 
    isMobileOpen, 
    setMobileOpen 
  } = useSidebar()

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-20 bg-gray-900/50 transition-opacity duration-200 md:hidden
          ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-30 
          flex flex-col flex-shrink-0
          transform transition-all duration-200
          md:translate-x-0 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-20' : customWidth ? `w-[${customWidth}px]` : 'w-72'}
        `}
      >
        <Sidebar />
        <ResizeHandle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 