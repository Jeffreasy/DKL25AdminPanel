import { RouteObject } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { PhotoManagementPage } from '../pages/PhotoManagementPage'
import { AlbumManagementPage } from '../pages/AlbumManagementPage'
import { VideoManagementPage } from '../pages/VideoManagementPage'
import { PartnerManagementPage } from '../pages/PartnerManagementPage'
import { SponsorManagementPage } from '../pages/SponsorManagementPage'
import { ProfilePage } from '../pages/ProfilePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AuthGuard } from '../components/auth/AuthGuard'
import { MainLayout } from '../components/layout/MainLayout'
import { OverviewTab } from '../pages/OverviewTab'
import { AanmeldingenTab } from '../pages/AanmeldingenTab'
import { ContactTab } from '../pages/ContactTab'
import { InboxTab } from '../pages/InboxTab'
import EmailInbox from '../features/email/components/EmailInbox'

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
        path: 'dashboard',
        element: <DashboardPage />,
        children: [
          {
            index: true,
            element: <OverviewTab />
          },
          {
            path: 'aanmeldingen',
            element: <AanmeldingenTab />
          },
          {
            path: 'contact',
            element: <ContactTab />
          },
          {
            path: 'inbox',
            element: <InboxTab />
          }
        ]
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
        path: 'emails',
        element: <EmailInbox />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
] 