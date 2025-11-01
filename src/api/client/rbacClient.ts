const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role?: boolean;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  is_system_permission?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPermission {
  user_id: string;
  email: string;
  role_name: string;
  resource: string;
  action: string;
  permission_assigned_at: string;
  role_assigned_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  is_active: boolean;
  expires_at?: string;
  role: Role;
}

export interface GroupedPermissionsResponse {
  groups: Array<{
    resource: string;
    permissions: Permission[];
    count: number;
  }>;
  total: number;
}

class RBACClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Roles
  async getRoles(): Promise<Role[]> {
    const response = await fetch(`${API_BASE}/api/rbac/roles`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.status}`);
    }

    return response.json();
  }

  async createRole(data: { name: string; description?: string }): Promise<Role> {
    const response = await fetch(`${API_BASE}/api/rbac/roles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create role: ${response.status}`);
    }

    return response.json();
  }

  async updateRole(id: string, data: { name?: string; description?: string }): Promise<Role> {
    const response = await fetch(`${API_BASE}/api/rbac/roles/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update role: ${response.status}`);
    }

    return response.json();
  }

  async deleteRole(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/rbac/roles/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete role: ${response.status}`);
    }
  }

  // Permissions
  async getPermissions(groupByResource = true): Promise<GroupedPermissionsResponse> {
    const url = groupByResource
      ? `${API_BASE}/api/rbac/permissions?group_by_resource=true`
      : `${API_BASE}/api/rbac/permissions`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch permissions: ${response.status}`);
    }

    return response.json();
  }

  async createPermission(data: {
    resource: string;
    action: string;
    description?: string;
    is_system_permission?: boolean;
  }): Promise<Permission> {
    const response = await fetch(`${API_BASE}/api/rbac/permissions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create permission: ${response.status}`);
    }

    return response.json();
  }

  async deletePermission(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/rbac/permissions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete permission: ${response.status}`);
    }
  }

  // Role-Permission assignments
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/rbac/roles/${roleId}/permissions/${permissionId}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to assign permission: ${response.status}`);
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/rbac/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to remove permission: ${response.status}`);
    }
  }

  // User-Role assignments
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const response = await fetch(`${API_BASE}/api/users/${userId}/roles`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user roles: ${response.status}`);
    }

    return response.json();
  }

  async assignRoleToUser(userId: string, roleId: string, expiresAt?: string): Promise<UserRole> {
    const response = await fetch(`${API_BASE}/api/users/${userId}/roles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role_id: roleId, expires_at: expiresAt })
    });

    if (!response.ok) {
      throw new Error(`Failed to assign role: ${response.status}`);
    }

    return response.json();
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to remove role: ${response.status}`);
    }
  }

  // User permissions
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    const response = await fetch(`${API_BASE}/api/users/${userId}/permissions`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user permissions: ${response.status}`);
    }

    return response.json();
  }

  // Cache management
  async refreshPermissionCache(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/api/rbac/cache/refresh`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh cache: ${response.status}`);
    }

    return response.json();
  }
}

export const rbacClient = new RBACClient();