import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 relative">
          <Header />
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
      <div id="mantine-modal-root" />
    </div>
  )
} 