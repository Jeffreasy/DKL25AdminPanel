import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { MainLayout } from './components/layout/MainLayout'
import { LoadingGrid } from './components/ui'

// Eager load critical pages
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { OverviewTab } from './features/dashboard/components/OverviewTab'

// Lazy load all other pages for better performance
const MediaManagementPage = lazy(() => import('./pages/MediaManagementPage').then(m => ({ default: m.MediaManagementPage })))
const VideoManagementPage = lazy(() => import('./pages/VideoManagementPage').then(m => ({ default: m.VideoManagementPage })))
const PartnerManagementPage = lazy(() => import('./pages/PartnerManagementPage').then(m => ({ default: m.PartnerManagementPage })))
const SponsorManagementPage = lazy(() => import('./pages/SponsorManagementPage').then(m => ({ default: m.SponsorManagementPage })))
const NewsletterManagementPage = lazy(() => import('./pages/NewsletterManagementPage').then(m => ({ default: m.NewsletterManagementPage })))
const UnderConstructionPage = lazy(() => import('./pages/UnderConstructionPage').then(m => ({ default: m.UnderConstructionPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const UserManagementPage = lazy(() => import('./pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })))
const AdminPermissionsPage = lazy(() => import('./pages/AdminPermissionsPage').then(m => ({ default: m.AdminPermissionsPage })))
const StepsAdminPage = lazy(() => import('./pages/StepsAdminPage').then(m => ({ default: m.StepsAdminPage })))
const AanmeldingenTab = lazy(() => import('./features/aanmeldingen/components/AanmeldingenTab').then(m => ({ default: m.AanmeldingenTab })))
const ContactTab = lazy(() => import('./features/contact/components/ContactTab').then(m => ({ default: m.ContactTab })))
const NotulenManagementPage = lazy(() => import('./pages/NotulenManagementPage').then(m => ({ default: m.NotulenManagementPage })))
const NotulenDetailPage = lazy(() => import('./pages/NotulenDetailPage').then(m => ({ default: m.NotulenDetailPage })))
const NotulenFormPage = lazy(() => import('./pages/NotulenFormPage').then(m => ({ default: m.NotulenFormPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage').then(m => ({ default: m.AccessDeniedPage })))
const EmailManagementPage = lazy(() => import('./pages/EmailManagementPage'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingGrid count={6} variant="compact" />
  </div>
)

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={
        <Suspense fallback={<PageLoader />}>
          <AccessDeniedPage />
        </Suspense>
      } />
      <Route
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />}>
          <Route index element={<OverviewTab />} />
          <Route path="aanmeldingen" element={
            <Suspense fallback={<PageLoader />}>
              <AanmeldingenTab />
            </Suspense>
          } />
          <Route path="contact" element={
            <Suspense fallback={<PageLoader />}>
              <ContactTab />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageLoader />}>
              <UserManagementPage />
            </Suspense>
          } />
        </Route>
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<OverviewTab />} />
          <Route path="aanmeldingen" element={
            <Suspense fallback={<PageLoader />}>
              <AanmeldingenTab />
            </Suspense>
          } />
          <Route path="contact" element={
            <Suspense fallback={<PageLoader />}>
              <ContactTab />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageLoader />}>
              <UserManagementPage />
            </Suspense>
          } />
        </Route>
        <Route path="/media" element={
          <Suspense fallback={<PageLoader />}>
            <MediaManagementPage />
          </Suspense>
        } />
        {/* Legacy redirects for backward compatibility */}
        <Route path="/photos" element={
          <Suspense fallback={<PageLoader />}>
            <MediaManagementPage />
          </Suspense>
        } />
        <Route path="/albums" element={
          <Suspense fallback={<PageLoader />}>
            <MediaManagementPage />
          </Suspense>
        } />
        <Route path="/videos" element={
          <Suspense fallback={<PageLoader />}>
            <VideoManagementPage />
          </Suspense>
        } />
        <Route path="/partners" element={
          <Suspense fallback={<PageLoader />}>
            <PartnerManagementPage />
          </Suspense>
        } />
        <Route path="/sponsors" element={
          <Suspense fallback={<PageLoader />}>
            <SponsorManagementPage />
          </Suspense>
        } />
        <Route path="/newsletters" element={
          <Suspense fallback={<PageLoader />}>
            <NewsletterManagementPage />
          </Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<PageLoader />}>
            <AdminPermissionsPage />
          </Suspense>
        } />
        <Route path="/steps-admin" element={
          <Suspense fallback={<PageLoader />}>
            <StepsAdminPage />
          </Suspense>
        } />
        <Route path="/frontend" element={
          <Suspense fallback={<PageLoader />}>
            <UnderConstructionPage />
          </Suspense>
        } />
        <Route path="/profile" element={
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        } />
        <Route path="/settings" element={
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        } />
        <Route path="/users" element={
          <Suspense fallback={<PageLoader />}>
            <UserManagementPage />
          </Suspense>
        } />
        <Route path="/notulen" element={
          <Suspense fallback={<PageLoader />}>
            <NotulenManagementPage />
          </Suspense>
        } />
        <Route path="/notulen/nieuw" element={
          <Suspense fallback={<PageLoader />}>
            <NotulenFormPage />
          </Suspense>
        } />
        <Route path="/notulen/:id" element={
          <Suspense fallback={<PageLoader />}>
            <NotulenDetailPage />
          </Suspense>
        } />
        <Route path="/notulen/:id/bewerken" element={
          <Suspense fallback={<PageLoader />}>
            <NotulenFormPage />
          </Suspense>
        } />
        <Route path="/email" element={
          <Suspense fallback={<PageLoader />}>
            <EmailManagementPage />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage />
          </Suspense>
        } />
      </Route>
    </Routes>
  )
}
