import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/auth/AuthProvider'
import { NavigationHistoryProvider } from './contexts/NavigationHistoryContext'
import { FavoritesContext } from './contexts/favorites/FavoritesContext'
import { SidebarContext } from './contexts/sidebar/SidebarContext'
import { App } from './App'
import './index.css'
import './styles/scrollbars.css'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  // Favorites State
  const [favorites, setFavorites] = useState<string[]>([])
  const addFavorite = useCallback((path: string) => {
    setFavorites(prev => [...prev, path])
  }, [])
  const removeFavorite = useCallback((path: string) => {
    setFavorites(prev => prev.filter(p => p !== path))
  }, [])

  // Sidebar State
  const [isOpen, setIsOpen] = useState(true)
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationHistoryProvider>
            <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
              <SidebarContext.Provider value={{ isOpen, toggle, close }}>
                {children}
              </SidebarContext.Provider>
            </FavoritesContext.Provider>
          </NavigationHistoryProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
)
