import { useContext, useMemo } from 'react';
import { AuthContext } from '../features/auth/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const permissions = useMemo(() => {
    if (!user?.permissions) return new Set();

    return new Set(
      user.permissions.map(p => `${p.resource}:${p.action}`)
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

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: Array.from(permissions)
  };
};