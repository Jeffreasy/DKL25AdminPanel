import { Routes, Route } from 'react-router-dom'
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
import { OverviewTab } from './pages/OverviewTab'
import { AanmeldingenTab } from './pages/AanmeldingenTab'
import { ContactTab } from './pages/ContactTab'
import { InboxTab } from './pages/InboxTab'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />}>
          <Route index element={<OverviewTab />} />
          <Route path="aanmeldingen" element={<AanmeldingenTab />} />
          <Route path="contact" element={<ContactTab />} />
          <Route path="inbox" element={<InboxTab />} />
        </Route>
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<OverviewTab />} />
          <Route path="aanmeldingen" element={<AanmeldingenTab />} />
          <Route path="contact" element={<ContactTab />} />
          <Route path="inbox" element={<InboxTab />} />
        </Route>
        <Route path="/photos" element={<PhotoManagementPage />} />
        <Route path="/albums" element={<AlbumManagementPage />} />
        <Route path="/videos" element={<VideoManagementPage />} />
        <Route path="/partners" element={<PartnerManagementPage />} />
        <Route path="/sponsors" element={<SponsorManagementPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
} 