import { createBrowserRouter, Outlet, Navigate, RouterProvider } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PhotoManagementPage } from './pages/PhotoManagementPage'
import { VideoManagementPage } from './pages/VideoManagementPage'
import { PartnerManagementPage } from './pages/PartnerManagementPage'
import { AlbumManagementPage } from './pages/AlbumManagementPage'
import { SponsorManagementPage } from './pages/SponsorManagementPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { NavigationHistoryProvider } from './contexts/NavigationHistoryContext'
import { AuthGuard } from './components/auth/AuthGuard'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )
  },
  {
    path: '/',
    element: (
      <AuthProvider>
        <SidebarProvider>
          <FavoritesProvider>
            <NavigationHistoryProvider>
              <AuthGuard>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </AuthGuard>
            </NavigationHistoryProvider>
          </FavoritesProvider>
        </SidebarProvider>
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'photos',
        element: <PhotoManagementPage />
      },
      {
        path: 'albums',
        element: <AlbumManagementPage />
      },
      {
        path: 'videos',
        element: <VideoManagementPage />
      },
      {
        path: 'partners',
        element: <PartnerManagementPage />
      },
      {
        path: 'sponsors',
        element: <SponsorManagementPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
} 