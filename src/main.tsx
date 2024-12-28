import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { AuthProvider } from './contexts/AuthContext'
import { routes } from './routes'
import { SidebarProvider } from './contexts/SidebarContext'
import { NavigationHistoryProvider } from './contexts/NavigationHistoryContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import './index.css'
import './styles/scrollbars.css'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient()

const router = createBrowserRouter(routes)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <AuthProvider>
            <SidebarProvider>
              <FavoritesProvider>
                <NavigationHistoryProvider>
                  <RouterProvider router={router} />
                </NavigationHistoryProvider>
              </FavoritesProvider>
            </SidebarProvider>
          </AuthProvider>
        </MantineProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
