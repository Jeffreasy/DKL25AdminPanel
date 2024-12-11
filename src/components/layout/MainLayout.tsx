import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

const navigationItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Foto Beheer', path: '/photos' }
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Navigation */}
              <nav className="flex space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="ml-4 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-6">
        {children}
      </main>
    </div>
  )
} 