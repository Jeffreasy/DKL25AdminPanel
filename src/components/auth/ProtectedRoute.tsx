import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { usePermissions } from '../../hooks/usePermissions'
import { LoadingGrid } from '../ui'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string // Format: "resource:action"
}

/**
 * ProtectedRoute component for permission-based route protection
 * 
 * Usage:
 * <Route path="/contacts" element={
 *   <ProtectedRoute requiredPermission="contact:read">
 *     <ContactManager />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()

  if (isLoading) {
    return <LoadingGrid variant="compact" count={4} />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission) {
    const [resource, action] = requiredPermission.split(':')
    if (!hasPermission(resource, action)) {
      return <Navigate to="/access-denied" replace />
    }
  }

  return <>{children}</>
}