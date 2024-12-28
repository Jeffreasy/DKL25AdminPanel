import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navigation } from './Navigation'

export function MainLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 