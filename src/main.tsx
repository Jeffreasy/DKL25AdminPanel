import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom'
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

// Create root element with providers
const RootElement = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AuthProvider>
          <SidebarProvider>
            <FavoritesProvider>
              <NavigationHistoryProvider>
                <Outlet />
              </NavigationHistoryProvider>
            </FavoritesProvider>
          </SidebarProvider>
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  </ErrorBoundary>
)

// Create router with root element and routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootElement />,
    children: routes
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
