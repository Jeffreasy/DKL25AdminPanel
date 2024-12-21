import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './pages/LoginPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { PhotoManagementPage } from './pages/PhotoManagementPage'
import { VideoManagementPage } from './pages/VideoManagementPage'
import { PartnerManagementPage } from './pages/PartnerManagementPage'
import { AlbumManagementPage } from './pages/AlbumManagementPage'
import { AccountSettingsPage } from './pages/AccountSettingsPage'
import { SponsorManagementPage } from './pages/SponsorManagementPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="partners" element={<PartnerManagementPage />} />
                  <Route path="photos" element={<PhotoManagementPage />} />
                  <Route path="albums" element={<AlbumManagementPage />} />
                  <Route path="videos" element={<VideoManagementPage />} />
                  <Route path="account-settings" element={<AccountSettingsPage />} />
                  <Route path="sponsors" element={<SponsorManagementPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App
