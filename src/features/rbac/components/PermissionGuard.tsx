/**
 * PermissionGuard Component
 * Conditional rendering gebaseerd op user permissions
 * Volgens backend docs: docs/backend Docs/api/PERMISSIONS.md
 */

import React from 'react';
import { usePermissions, Permission, ResourceType, ActionType } from '../hooks/usePermissions';

/**
 * PermissionGuard Props
 */
interface PermissionGuardProps {
  /** Children to render if permission check passes */
  children: React.ReactNode;
  
  /** Single permission required */
  permission?: Permission;
  
  /** Multiple permissions (requires ANY) */
  anyPermissions?: Permission[];
  
  /** Multiple permissions (requires ALL) */
  allPermissions?: Permission[];
  
  /** Resource and action (builds permission string) */
  resource?: ResourceType;
  action?: ActionType;
  
  /** Fallback component if no permission */
  fallback?: React.ReactNode;
  
  /** Show loading state while checking */
  loadingComponent?: React.ReactNode;
}

/**
 * PermissionGuard Component
 * 
 * @example
 * ```tsx
 * // Single permission
 * <PermissionGuard permission="user:write">
 *   <EditButton />
 * </PermissionGuard>
 * 
 * // Any of multiple permissions
 * <PermissionGuard anyPermissions={['user:write', 'admin:manage']}>
 *   <EditButton />
 * </PermissionGuard>
 * 
 * // All permissions required
 * <PermissionGuard allPermissions={['user:write', 'user:delete']}>
 *   <DeleteButton />
 * </PermissionGuard>
 * 
 * // Using resource + action
 * <PermissionGuard resource="user" action="write">
 *   <EditButton />
 * </PermissionGuard>
 * 
 * // With fallback
 * <PermissionGuard 
 *   permission="admin:manage"
 *   fallback={<div>Je hebt geen toegang</div>}
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  permission,
  anyPermissions,
  allPermissions,
  resource,
  action,
  fallback = null,
  loadingComponent = null,
}: PermissionGuardProps): React.ReactElement | null {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Show loading state if checking permissions
  if (loading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  // Check single permission
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Check any permissions
  if (anyPermissions && anyPermissions.length > 0) {
    return hasAnyPermission(anyPermissions) ? <>{children}</> : <>{fallback}</>;
  }

  // Check all permissions
  if (allPermissions && allPermissions.length > 0) {
    return hasAllPermissions(allPermissions) ? <>{children}</> : <>{fallback}</>;
  }

  // Check resource + action
  if (resource && action) {
    const perm = `${resource}:${action}`;
    return hasPermission(perm) ? <>{children}</> : <>{fallback}</>;
  }

  // No permission check specified - render children by default
  return <>{children}</>;
}

/**
 * WithPermission HOC
 * Wrapper component met permission check
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard permission={permission}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Hook om disabled state te bepalen gebaseerd op permissions
 */
export function usePermissionDisabled(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return !hasPermission(permission);
}

/**
 * Hook om visibility te bepalen gebaseerd op permissions
 */
export function usePermissionVisible(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}