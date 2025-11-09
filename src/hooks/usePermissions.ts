import { useContext, useMemo } from 'react';
import { AuthContext } from '../features/auth/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const permissions = useMemo(() => {
    if (!user?.permissions || !Array.isArray(user.permissions)) return new Set();

    return new Set(
      user.permissions
        .filter(p => p && typeof p.resource === 'string' && typeof p.action === 'string')
        .map(p => `${p.resource}:${p.action}`)
    );
  }, [user?.permissions]);

  const hasPermission = (resource: string, action: string) => {
    return permissions.has(`${resource}:${action}`);
  };

  const hasAnyPermission = (...perms: string[]) => {
    return perms.some(perm => {
      const [resource, action] = perm.split(':');
      return hasPermission(resource, action);
    });
  };

  const hasAllPermissions = (...perms: string[]) => {
    return perms.every(perm => {
      const [resource, action] = perm.split(':');
      return hasPermission(resource, action);
    });
  };

  const hasRole = (roleName: string) => {
    if (!user?.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some(role => role.name === roleName);
  };

  const hasAnyRole = (...roleNames: string[]) => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  const isAdmin = () => hasRole('admin');
  const isStaff = () => hasRole('staff') || hasRole('admin');

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    permissions: Array.from(permissions)
  };
};