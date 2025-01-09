import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { SponsorManagementPage } from './pages/SponsorManagementPage'
import { PhotoManagementPage } from './pages/PhotoManagementPage'
import { PartnerManagementPage } from './pages/PartnerManagementPage'
import { SettingsPage } from './pages/SettingsPage'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />
      },
      {
        path: '/sponsors',
        element: <SponsorManagementPage />
      },
      {
        path: '/photos',
        element: <PhotoManagementPage />
      },
      {
        path: '/partners',
        element: <PartnerManagementPage />
      },
      {
        path: '/settings',
        element: <SettingsPage />
      }
    ]
  }
])

export function App() {
  return <RouterProvider router={router} />
} 