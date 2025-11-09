import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { usePermissions } from '../../hooks/usePermissions'
import { LoadingGrid } from '../ui'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string // Format: "resource:action"
  requiredPermissions?: string[] // Multiple permissions (OR logic)
  requiredRole?: string // Required role
  requiredRoles?: string[] // Multiple roles (OR logic)
  requireAllPermissions?: boolean // If true, requires ALL permissions instead of ANY
  requireAllRoles?: boolean // If true, requires ALL roles instead of ANY
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
 *
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredPermissions={["admin:access", "user:manage"]}>
 *     <AdminPanel />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requiredRole,
  requiredRoles,
  requireAllPermissions = false,
  requireAllRoles = false
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermissions()

  if (isLoading) {
    return <LoadingGrid variant="compact" count={4} />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check single permission
  if (requiredPermission) {
    const [resource, action] = requiredPermission.split(':')
    if (!hasPermission(resource, action)) {
      return <Navigate to="/access-denied" replace />
    }
  }

  // Check multiple permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAllPermissions
      ? hasAllPermissions(...requiredPermissions)
      : hasAnyPermission(...requiredPermissions)

    if (!hasAccess) {
      return <Navigate to="/access-denied" replace />
    }
  }

  // Check single role
  if (requiredRole) {
    if (!hasRole(requiredRole)) {
      return <Navigate to="/access-denied" replace />
    }
  }

  // Check multiple roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requireAllRoles
      ? requiredRoles.every(role => hasRole(role))
      : hasAnyRole(...requiredRoles)

    if (!hasAccess) {
      return <Navigate to="/access-denied" replace />
    }
  }

  return <>{children}</>
}