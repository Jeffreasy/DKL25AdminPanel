import { RouteObject } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
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
      }
    ]
  }
] 