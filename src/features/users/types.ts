export interface Permission {
  resource: string
  action: string
}

export interface PermissionWithId extends Permission {
  id: string
  description?: string
  is_system_permission?: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
  is_system_role?: boolean
  permissions?: PermissionWithId[]
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  naam: string
  // DEPRECATED: Legacy field - will be removed in future version
  // Use roles array instead
  rol?: string
  // RBAC roles - primary source
  roles?: Array<{ id: string; name: string; description?: string }>
  permissions?: Permission[]
  is_actief: boolean
  newsletter_subscribed: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  email: string
  naam: string
  // DEPRECATED: Use role_ids array for RBAC
  rol?: string
  role_ids?: string[]
  password: string
  is_actief: boolean
  newsletter_subscribed: boolean
}

export interface UpdateUserRequest {
  email?: string
  naam?: string
  // DEPRECATED: Use role_ids array for RBAC
  rol?: string
  role_ids?: string[]
  password?: string
  is_actief?: boolean
  newsletter_subscribed?: boolean
}

export interface CreatePermissionRequest {
  resource: string
  action: string
  description: string
  is_system_permission?: boolean
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permission_ids?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permission_ids?: string[]
}

export interface GroupedPermissionsResponse {
  groups: Array<{
    resource: string;
    permissions: PermissionWithId[];
    count: number;
  }>;
  total: number;
}
