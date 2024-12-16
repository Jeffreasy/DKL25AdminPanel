import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'

export function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar voor desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="h-8 w-auto"
                src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png"
                alt="DKL25"
              />
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <Navigation />
            </div>
          </div>
        </div>
      </div>

      {/* Mobiele header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <img
            className="h-8 w-auto"
            src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png"
            alt="DKL25"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <span className="sr-only">Open menu</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobiel menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40">
            <div 
              className="absolute inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
              onClick={handleCloseMenu}
            />
            <div className="relative bg-white h-full w-full sm:w-64 p-4 transform transition-transform duration-300">
              <Navigation onNavigate={handleCloseMenu} />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none md:pt-0 pt-16">
          <div className="py-6">
            <div className="max-w-screen-safe mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 