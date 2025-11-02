
# User Roles API - Frontend Integratie

**Versie**: 1.0  
**Datum**: 2025-11-02  
**Backend Handler**: [`handlers/user_handler.go`](../../handlers/user_handler.go)  
**Status**: ✅ Production Ready

---

## 📋 Inhoudsopgave

1. [GET /api/users/:id/roles](#get-apiusersid roles)
2. [POST /api/users/:id/roles](#post-apiusersid roles)
3. [PUT /api/users/:id/roles](#put-apiusersid roles-bulk)
4. [DELETE /api/users/:id/roles/:roleId](#delete-apiusersidroles roleid)
5. [GET /api/users/:id/permissions](#get-apiusersidpermissions)
6. [Troubleshooting](#troubleshooting)

---

## GET /api/users/:id/roles

Deze endpoint wordt gebruikt om alle rollen van een gebruiker op te halen.

### Route Registratie
De route wordt geregistreerd in [`handlers/user_handler.go:40`](../../handlers/user_handler.go:40):
```go
app.Get("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "read"), 
    h.GetUserRoles
)
```

### Vereiste Headers
- `Authorization: Bearer <jwt_token>` (verplicht)
- `Content-Type: application/json`

### Vereiste Permissies
De gebruiker moet de permissie `user:read` hebben.

### URL Parameters
- `:id` - De UUID van de gebruiker (bijvoorbeeld: `0197cfc3-7ca2-403b-ae4d-32627cd47222`)

### Response Format

**Succes (200 OK):**
```json
[
  {
    "id": "uuid",
    "user_id": "0197cfc3-7ca2-403b-ae4d-32627cd47222",
    "role_id": "uuid",
    "role": {
      "id": "uuid",
      "name": "admin",
      "display_name": "Administrator",
      "description": "Full system access",
      "permissions": [
        {
          "id": "perm-uuid",
          "resource": "admin",
          "action": "access",
          "description": "Admin panel access"
        }
      ]
    },
    "assigned_by": "uuid",
    "assigned_at": "2025-01-15T10:30:00Z",
    "expires_at": null,
    "is_active": true
  }
]
```

**Errors:**
- `401 Unauthorized` - Geen geldig JWT token
- `403 Forbidden` - Gebruiker heeft geen `user:read` permissie
- `500 Internal Server Error` - Database of server fout

### Frontend Implementatie

#### JavaScript/TypeScript Client
```typescript
async function getUserRoles(userId: string): Promise<UserRole[]> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/roles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
```

#### React Hook Example
```typescript
import { useState, useEffect } from 'react';

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role: Role;
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
}

function useUserRoles(userId: string) {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRoles() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/roles`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setRoles(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserRoles();
    }
  }, [userId]);

  return { roles, loading, error };
}

// Usage in component
function UserRolesDisplay({ userId }: { userId: string }) {
  const { roles, loading, error } = useUserRoles(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>User Roles</h3>
      <ul>
        {roles.map(userRole => (
          <li key={userRole.id}>
            {userRole.role.display_name} ({userRole.role.name})
            {userRole.expires_at && ` - Expires: ${new Date(userRole.expires_at).toLocaleDateString()}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### React Query Implementation (Recommended)
**Used in**: [`UserRoleAssignmentModal.tsx:26-30`](../../src/features/users/components/UserRoleAssignmentModal.tsx:26-30)

```typescript
import { useQuery } from '@tanstack/react-query';

const { data: userRoles = [], isLoading, error } = useQuery({
  queryKey: ['userRoles', userId],
  queryFn: () => rbacClient.getUserRoles(userId),
  enabled: !!userId, // Only fetch when userId is available
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  retry: 1
});
```

### Backend Implementation
Handler in [`handlers/user_handler.go:154`](../../handlers/user_handler.go:154):
```go
func (h *UserHandler) GetUserRoles(c *fiber.Ctx) error {
    userID := c.Params("id")

    userRoles, err := h.userRoleRepo.GetByUserIDWithRoles(c.Context(), userID)
    if err != nil {
        logger.Error("Fout bij ophalen user roles", "error", err, "user_id", userID)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon user roles niet ophalen",
        })
    }

    return c.JSON(userRoles)
}
```

### Repository Method
Via [`repository.UserRoleRepository.GetByUserIDWithRoles()`](../../repository/user_role_repository.go):
- Haalt alle actieve user-role relations op voor de gegeven user ID
- Laadt volledige role informatie via preloading (incl. permissions)
- Retourneert alleen actieve (`is_active = true`) relaties
- Filtert expired roles (`expires_at IS NULL OR expires_at > NOW()`)

---

## POST /api/users/:id/roles

Toewijzen van een **enkele** rol aan een gebruiker.

### Route Registratie
```go
app.Post("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "manage_roles"), 
    h.AssignRoleToUser
)
```

### Vereiste Headers
- `Authorization: Bearer <jwt_token>` (verplicht)
- `Content-Type: application/json`

### Vereiste Permissies
De gebruiker moet de permissie `user:manage_roles` hebben.

### URL Parameters
- `:id` - De UUID van de gebruiker

### Request Body
```json
{
  "role_id": "role-uuid",
  "expires_at": "2025-12-31T23:59:59Z"  // Optional: RFC3339 format
}
```

### Response Format

**Succes (201 Created):**
```json
{
  "id": "user-role-uuid",
  "user_id": "user-uuid",
  "role_id": "role-uuid",
  "role": {
    "id": "role-uuid",
    "name": "admin",
    "display_name": "Administrator",
    "description": "Full admin access",
    "is_system_role": true
  },
  "assigned_by": "current-user-uuid",
  "assigned_at": "2025-11-02T14:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z",
  "is_active": true
}
```

**Errors:**
- `400 Bad Request` - Missing role_id of invalid expires_at format
- `401 Unauthorized` - Geen geldig JWT token
- `403 Forbidden` - Geen `user:manage_roles` permissie
- `409 Conflict` - User heeft deze rol al
- `500 Internal Server Error` - Database error

### Frontend Implementatie

#### TypeScript Client
```typescript
async function assignRole(
  userId: string, 
  roleId: string, 
  expiresAt?: string
): Promise<UserRole> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role_id: roleId,
      expires_at: expiresAt // Optional: RFC3339 format
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign role');
  }
  
  return await response.json();
}
```

#### React Mutation Example
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useAssignRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roleId, expiresAt }: {
      userId: string;
      roleId: string;
      expiresAt?: string;
    }) => rbacClient.assignRoleToUser(userId, roleId, expiresAt),
    
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['userRoles', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    
    onError
(error) => {
      console.error('Failed to assign role:', error);
      // Show error toast/notification
    }
  });
}

// Usage in component
function RoleAssignmentButton({ userId, roleId }: { userId: string; roleId: string }) {
  const assignRole = useAssignRole();
  
  const handleClick = () => {
    assignRole.mutate({ userId, roleId });
  };
  
  return (
    <button onClick={handleClick} disabled={assignRole.isPending}>
      {assignRole.isPending ? 'Assigning...' : 'Assign Role'}
    </button>
  );
}
```

---

## PUT /api/users/:id/roles (Bulk)

Toewijzen van **meerdere** rollen aan een gebruiker in één keer (admin only).

### Route Registratie
```go
app.Put("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    AdminPermissionMiddleware(h.permissionService),
    h.AssignRolesToUser
)
```

### Request Body
```json
{
  "role_ids": ["role-uuid-1", "role-uuid-2"]
}
```

### Response
```json
{
  "success": true,
  "message": "Roles toegewezen aan user",
  "assigned_roles": 2,
  "total_requested": 2
}
```

---

## DELETE /api/users/:id/roles/:roleId

Verwijderen van een rol van een gebruiker.

### Frontend Implementatie
```typescript
async function removeRole(userId: string, roleId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to remove role: ${response.status}`);
  }
}
```

---

## GET /api/users/:id/permissions

Ophalen van alle effectieve permissies van een gebruiker.

### Response
```json
[
  {
    "user_id": "uuid",
    "email": "user@example.nl",
    "role_name": "admin",
    "resource": "admin",
    "action": "access",
    "permission_assigned_at": "2024-01-01T00:00:00Z",
    "role_assigned_at": "2024-11-01T10:00:00Z"
  }
]
```

---

## Troubleshooting

### Debug Logs
```typescript
console.log('Request URL:', `${API_BASE_URL}/api/users/${userId}/roles`);
console.log('Method:', 'GET');
console.log('Token:', token.substring(0, 20) + '...');
```

### Common Errors
- **405 Method Not Allowed**: Verkeerde HTTP method of URL typo
- **401 Unauthorized**: Token missing/expired
- **403 Forbidden**: Insufficient permissions
- **409 Conflict**: Role already assigned

---

**Status**: ✅ Complete  
**Datum**: 2025-11-02