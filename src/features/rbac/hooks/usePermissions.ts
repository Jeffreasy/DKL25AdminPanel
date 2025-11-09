/**
 * usePermissions Hook
 * Hook voor permission checking in components
 * Volgens backend docs: docs/backend Docs/api/PERMISSIONS.md
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { apiConfig } from '@/config/api.config';
import { TokenManager } from '@/features/auth/contexts/TokenManager';

/**
 * Permission format: "resource:action"
 * Examples: "user:read", "article:write", "admin:manage"
 */
export type Permission = string;

/**
 * Resource types (from backend docs)
 */
export type ResourceType =
  | 'user'
  | 'role'
  | 'permission'
  | 'contact'
  | 'participant'
  | 'registration'
  | 'event'
  | 'steps'
  | 'route_fund'
  | 'achievement'
  | 'badge'
  | 'leaderboard'
  | 'notulen'
  | 'newsletter'
  | 'notification'
  | 'email'
  | 'chat'
  | 'video'
  | 'partner'
  | 'sponsor'
  | 'photo'
  | 'album'
  | 'radio_recording'
  | 'program_schedule'
  | 'social_link'
  | 'social_embed'
  | 'title_section'
  | 'under_construction'
  | 'image'
  | 'admin';

/**
 * Action types (from backend docs)
 */
export type ActionType = 
  | 'read'
  | 'write'
  | 'delete'
  | 'manage'
  | 'send'
  | 'fetch'
  | 'moderate'
  | string;

/**
 * Permission check result
 */
interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Permissions hook return type
 */
interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  checkPermission: (resource: ResourceType, action: ActionType) => Promise<PermissionCheckResult>;
  permissions: string[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Permission cache
 */
const permissionCache = new Map<string, boolean>();
const cacheTimestamps = new Map<string, number>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * usePermissions Hook
 */
export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.permissions && Array.isArray(user.permissions)) {
      setPermissions(user.permissions as unknown as string[]);
    } else {
      setPermissions([]);
    }
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (permissions.includes('admin:manage')) {
      return true;
    }
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: Permission[]): boolean => {
    if (permissions.includes('admin:manage')) {
      return true;
    }
    return perms.some(p => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((perms: Permission[]): boolean => {
    if (permissions.includes('admin:manage')) {
      return true;
    }
    return perms.every(p => permissions.includes(p));
  }, [permissions]);

  const checkPermission = useCallback(async (
    resource: ResourceType,
    action: ActionType
  ): Promise<PermissionCheckResult> => {
    const cacheKey = `${resource}:${action}`;
    
    // Check cache
    const cached = permissionCache.get(cacheKey);
    const timestamp = cacheTimestamps.get(cacheKey);
    
    if (cached !== undefined && timestamp && Date.now() - timestamp < CACHE_TTL) {
      return { allowed: cached };
    }

    try {
      setLoading(true);
      setError(null);

      const token = TokenManager.getValidToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${apiConfig.baseURL}/api/permissions/check?resource=${resource}&action=${action}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Permission check failed');
      }

      const data = await response.json();
      const result: PermissionCheckResult = data.success 
        ? data.data 
        : { allowed: false };

      // Cache result
      permissionCache.set(cacheKey, result.allowed);
      cacheTimestamps.set(cacheKey, Date.now());

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Permission check failed';
      setError(errorMessage);
      return { allowed: false, reason: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = TokenManager.getValidToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${apiConfig.baseURL}/api/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      if (data.success && data.data?.permissions) {
        setPermissions(data.data.permissions);
      }

      // Clear cache
      permissionCache.clear();
      cacheTimestamps.clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    permissions,
    loading,
    error,
    reload,
  };
}

export function buildPermission(resource: ResourceType, action: ActionType): Permission {
  return `${resource}:${action}`;
}

export function parsePermission(permission: Permission): { resource: string; action: string } | null {
  const parts = permission.split(':');
  if (parts.length !== 2) {
    return null;
  }
  return {
    resource: parts[0],
    action: parts[1],
  };
}