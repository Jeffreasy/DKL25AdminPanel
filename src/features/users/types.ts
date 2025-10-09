export interface Permission {
  resource: string
  action: string
}

export interface PermissionWithId extends Permission {
  id: string
  description: string
  is_system_permission: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions?: PermissionWithId[]
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  naam: string
  rol: string
  permissions?: Permission[]
  is_actief: boolean
  newsletter_subscribed: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  email: string
  naam: string
  rol: string
  password: string
  is_actief: boolean
  newsletter_subscribed: boolean
}

export interface UpdateUserRequest {
  email?: string
  naam?: string
  rol?: string
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
