import { RouteObject } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PhotoManagementPage } from './pages/PhotoManagementPage'
import { AlbumManagementPage } from './pages/AlbumManagementPage'
import { VideoManagementPage } from './pages/VideoManagementPage'
import { PartnerManagementPage } from './pages/PartnerManagementPage'
import { SponsorManagementPage } from './pages/SponsorManagementPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AuthGuard } from './components/auth/AuthGuard'
import { MainLayout } from './components/layout/MainLayout'

export const routes: RouteObject[] = [
  {
    path: 'login',
    element: <LoginPage />
  },
  {
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: '/',
        element: <DashboardPage />
      },
      {
        path: '/dashboard',
        element: <DashboardPage />
      },
      {
        path: '/photos',
        element: <PhotoManagementPage />
      },
      {
        path: '/albums',
        element: <AlbumManagementPage />
      },
      {
        path: '/videos',
        element: <VideoManagementPage />
      },
      {
        path: '/partners',
        element: <PartnerManagementPage />
      },
      {
        path: '/sponsors',
        element: <SponsorManagementPage />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
] 