/**
 * RBAC (Role-Based Access Control) Module
 * Export alle permission-gerelateerde functionaliteit
 */

// Hooks
export { usePermissions } from './hooks/usePermissions';
export type {
  Permission,
  ResourceType,
  ActionType,
} from './hooks/usePermissions';

export {
  buildPermission,
  parsePermission,
} from './hooks/usePermissions';

// Components
export {
  PermissionGuard,
  withPermission,
  usePermissionDisabled,
  usePermissionVisible,
} from './components/PermissionGuard';