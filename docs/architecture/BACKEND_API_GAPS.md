# 🔍 Backend API Gaps - RBAC Endpoints

**Datum**: 2025-11-02
**Status**: ✅ RESOLVED - All endpoints implemented
**Frontend Versie**: Current
**Backend Versie**: user_handler.go (updated)
**Resolution Date**: 2025-11-02

---

## 📋 ✅ Ontbrekende & Mismatched Endpoints - RESOLVED

### ✅ OPGELOST: Geïmplementeerde Endpoints

#### 1. GET /api/users/:userId/roles
**Status**: ✅ **GEÏMPLEMENTEERD**
**Datum**: 2025-11-02
**Prioriteit**: 🔴 HIGH
**Frontend Gebruik**: [`UserRoleAssignmentModal.tsx:26-30`](../../src/features/users/components/UserRoleAssignmentModal.tsx:26-30)

**Frontend Code**:
```typescript
const { data: userRoles = [] } = useQuery({
  queryKey: ['userRoles', user?.id],
  queryFn: () => user ? rbacClient.getUserRoles(user.id) : Promise.resolve([]),
  enabled: isOpen && !!user
})

// rbacClient.getUserRoles() roept aan:
// GET /api/users/${userId}/roles
```

**Verwachte Response**:
```json
[
  {
    "id": "user-role-uuid",
    "user_id": "user-uuid",
    "role_id": "role-uuid",
    "assigned_at": "2024-11-02T12:00:00Z",
    "is_active": true,
    "expires_at": null,
    "role": {
      "id": "role-uuid",
      "name": "admin",
      "description": "Full admin access",
      "is_system_role": true,
      "permissions": [...],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
]
```

**Backend Implementatie Voorbeeld**:
```go
func (h *UserHandler) GetUserRoles(c *fiber.Ctx) error {
    userID := c.Params("id")
    
    userRoles, err := h.userRoleRepo.GetByUserID(c.Context(), userID)
    if err != nil {
        logger.Error("Fout bij ophalen user roles", "error", err, "user_id", userID)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon user roles niet ophalen",
        })
    }
    
    return c.JSON(userRoles)
}

// Toevoegen aan RegisterRoutes:
app.Get("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "read"), 
    h.GetUserRoles
)
```

---

#### 2. GET /api/users/:userId/permissions
**Status**: ❌ **ONTBREEKT**  
**Prioriteit**: 🟡 MEDIUM  
**Frontend Gebruik**: [`rbacClient.ts:222-232`](../../src/api/client/rbacClient.ts:222-232)

**Frontend Code**:
```typescript
async getUserPermissions(userId: string): Promise<UserPermission[]> {
  const response = await fetch(`${API_BASE}/api/users/${userId}/permissions`, {
    headers: this.getAuthHeaders()
  });
  return response.json();
}
```

**Verwachte Response**:
```json
[
  {
    "user_id": "user-uuid",
    "email": "user@example.nl",
    "role_name": "admin",
    "resource": "admin",
    "action": "access",
    "permission_assigned_at": "2024-01-01T00:00:00Z",
    "role_assigned_at": "2024-11-01T10:00:00Z"
  },
  ...
]
```

**Backend Implementatie Voorbeeld**:
```go
func (h *UserHandler) GetUserPermissions(c *fiber.Ctx) error {
    userID := c.Params("id")
    
    permissions, err := h.permissionService.GetUserPermissions(c.Context(), userID)
    if err != nil {
        logger.Error("Fout bij ophalen user permissions", "error", err, "user_id", userID)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon user permissions niet ophalen",
        })
    }
    
    return c.JSON(permissions)
}

// Toevoegen aan RegisterRoutes:
app.Get("/api/users/:id/permissions", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "read"), 
    h.GetUserPermissions
)
```

---

### ⚠️ API METHOD MISMATCH

#### 3. POST /api/users/:userId/roles (Single Role Assignment)
**Status**: ⚠️ **METHOD MISMATCH**  
**Prioriteit**: 🔴 HIGH  

**Probleem**:
- **Frontend verwacht**: `POST /api/users/:userId/roles` voor SINGLE role assignment
- **Backend heeft**: `PUT /api/users/:id/roles` voor BULK roles assignment

**Frontend Code** ([`rbacClient.ts:196-208`](../../src/api/client/rbacClient.ts:196-208)):
```typescript
async assignRoleToUser(userId: string, roleId: string, expiresAt?: string): Promise<UserRole> {
  const response = await fetch(`${API_BASE}/api/users/${userId}/roles`, {
    method: 'POST',  // ← POST method
    headers: this.getAuthHeaders(),
    body: JSON.stringify({ 
      role_id: roleId,        // ← Single role_id
      expires_at: expiresAt 
    })
  });
  return response.json();
}
```

**Backend Code** (user_handler.go):
```go
// Huidige implementatie - PUT method, verwacht role_ids ARRAY
app.Put("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    AdminPermissionMiddleware(h.permissionService), 
    h.AssignRolesToUser
)

func (h *UserHandler) AssignRolesToUser(c *fiber.Ctx) error {
    var req struct {
        RoleIDs []string `json:"role_ids"`  // ← Verwacht ARRAY
    }
    // ...
}
```

**Oplossing 1 - Voeg POST endpoint toe** (RECOMMENDED):
```go
// Nieuwe single role assignment endpoint
func (h *UserHandler) AssignRoleToUser(c *fiber.Ctx) error {
    userID := c.Params("id")
    
    var req struct {
        RoleID    string  `json:"role_id"`
        ExpiresAt *string `json:"expires_at,omitempty"`
    }
    
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Ongeldige gegevens",
        })
    }
    
    currentUserID, _ := c.Locals("userID").(string)
    
    ur := &models.UserRole{
        UserID:     userID,
        RoleID:     req.RoleID,
        AssignedBy: &currentUserID,
        IsActive:   true,
    }
    
    if req.ExpiresAt != nil {
        // Parse expires_at timestamp
        // ur.ExpiresAt = parsed time
    }
    
    if err := h.userRoleRepo.Create(c.Context(), ur); err != nil {
        logger.Error("Fout bij toewijzen role", "error", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon role niet toewijzen",
        })
    }
    
    // Load full role object voor response
    role, _ := h.roleRepo.GetByID(c.Context(), req.RoleID)
    ur.Role = role
    
    return c.Status(fiber.StatusCreated).JSON(ur)
}

// Toevoegen aan RegisterRoutes:
app.Post("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "manage_roles"), 
    h.AssignRoleToUser
)
```

**Oplossing 2 - Update Frontend** (Alternatief):
Frontend aanpassen om PUT method te gebruiken met role_ids array, maar dit breekt huidige functionaliteit.

---

## 📊 Volledige Endpoint Vergelijking

### User-Role Management Endpoints

| Endpoint | Method | Frontend | Backend | Status |
|----------|--------|----------|---------|--------|
| `/api/users/:id/roles` | GET | ✅ Gebruikt | ❌ Ontbreekt | 🔴 CRITICAL |
| `/api/users/:id/roles` | POST | ✅ Gebruikt | ❌ Ontbreekt | 🔴 CRITICAL |
| `/api/users/:id/roles` | PUT | ❌ Niet gebruikt | ✅ Geïmplementeerd | ⚠️ MISMATCH |
| `/api/users/:id/roles/:roleId` | DELETE | ✅ Gebruikt | ✅ Geïmplementeerd | ✅ OK |
| `/api/users/:id/permissions` | GET | ✅ Gebruikt | ❌ Ontbreekt | 🟡 MEDIUM |

### RBAC Management Endpoints (Verondersteld)

Deze zijn gedocumenteerd in [`AUTH_AND_RBAC.md`](backend/AUTH_AND_RBAC.md) maar kunnen mogelijk ook ontbreken:

| Endpoint | Method | Frontend | Status | Prioriteit |
|----------|--------|----------|--------|-----------|
| `/api/rbac/roles` | GET | ✅ | Verify | 🔴 HIGH |
| `/api/rbac/roles/:id` | GET | ❌ | Verify | 🟢 LOW |
| `/api/rbac/roles` | POST | ✅ | Verify | 🔴 HIGH |
| `/api/rbac/roles/:id` | PUT | ✅ | Verify | 🟡 MEDIUM |
| `/api/rbac/roles/:id` | DELETE | ✅ | Verify | 🟡 MEDIUM |
| `/api/rbac/permissions` | GET | ✅ | Verify | 🔴 HIGH |
| `/api/rbac/permissions` | POST | ✅ | Verify | 🟡 MEDIUM |
| `/api/rbac/permissions/:id` | DELETE | ✅ | Verify | 🟡 MEDIUM |
| `/api/rbac/roles/:roleId/permissions/:permId` | POST | ✅ | Verify | 🔴 HIGH |
| `/api/rbac/roles/:roleId/permissions/:permId` | DELETE | ✅ | Verify | 🟡 MEDIUM |
| `/api/rbac/cache/refresh` | POST | ✅ | Verify | 🟢 LOW |

---

## 🔧 Aanbevolen Backend Wijzigingen

### Prioriteit 1: CRITICAL (Blokkeert functionaliteit)

**File**: `handlers/user_handler.go`

```go
// 1. Voeg toe aan RegisterRoutes():
app.Get("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "read"), 
    h.GetUserRoles
)

app.Post("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "manage_roles"), 
    h.AssignRoleToUser
)

// 2. Implementeer GetUserRoles handler:
func (h *UserHandler) GetUserRoles(c *fiber.Ctx) error {
    userID := c.Params("id")
    
    // Get user roles with populated role objects
    userRoles, err := h.userRoleRepo.GetByUserIDWithRoles(c.Context(), userID)
    if err != nil {
        logger.Error("Fout bij ophalen user roles", "error", err, "user_id", userID)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon user roles niet ophalen",
        })
    }
    
    return c.JSON(userRoles)
}

// 3. Implementeer AssignRoleToUser handler (SINGLE):
func (h *UserHandler) AssignRoleToUser(c *fiber.Ctx) error {
    userID := c.Params("id")
    
    var req struct {
        RoleID    string  `json:"role_id"`
        ExpiresAt *string `json:"expires_at,omitempty"`
    }
    
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Ongeldige gegevens",
        })
    }
    
    if req.RoleID == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Role ID is verplicht",
        })
    }
    
    currentUserID, _ := c.Locals("userID").(string)
    
    ur := &models.UserRole{
        UserID:     userID,
        RoleID:     req.RoleID,
        AssignedBy: &currentUserID,
        IsActive:   true,
    }
    
    // Parse expires_at if provided
    if req.ExpiresAt != nil && *req.ExpiresAt != "" {
        t, err := time.Parse(time.RFC3339, *req.ExpiresAt)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "error": "Ongeldige expires_at formaat (use RFC3339)",
            })
        }
        ur.ExpiresAt = &t
    }
    
    // Create user-role relationship
    if err := h.userRoleRepo.Create(c.Context(), ur); err != nil {
        // Check for duplicate
        if strings.Contains(err.Error(), "duplicate") {
            return c.Status(fiber.StatusConflict).JSON(fiber.Map{
                "error": "User heeft deze rol al",
            })
        }
        logger.Error("Fout bij toewijzen role", "error", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon role niet toewijzen",
        })
    }
    
    // Load full role object for response
    role, err := h.roleRepo.GetByID(c.Context(), req.RoleID)
    if err == nil {
        ur.Role = *role
    }
    
    return c.Status(fiber.StatusCreated).JSON(ur)
}
```

**Repository Method Nodig**:
```go
// In user_role_repository.go
func (r *UserRoleRepository) GetByUserIDWithRoles(ctx context.Context, userID string) ([]models.UserRole, error) {
    var userRoles []models.UserRole
    
    err := r.db.WithContext(ctx).
        Preload("Role").                    // Load role object
        Preload("Role.Permissions").        // Load role's permissions
        Where("user_id = ?", userID).
        Where("is_active = ?", true).
        Find(&userRoles).Error
    
    return userRoles, err
}
```

---

#### 4. GET /api/users/:userId/permissions
**Status**: ❌ **ONTBREEKT**  
**Prioriteit**: 🟡 MEDIUM  
**Frontend Gebruik**: [`rbacClient.ts:222-232`](../../src/api/client/rbacClient.ts:222-232)

**Frontend Code**:
```typescript
async getUserPermissions(userId: string): Promise<UserPermission[]> {
  const response = await fetch(`${API_BASE}/api/users/${userId}/permissions`, {
    headers: this.getAuthHeaders()
  });
  return response.json();
}
```

**Backend Implementatie Voorbeeld**:
```go
func (h *UserHandler) GetUserPermissions(c *fiber.Ctx) error {
    userID := c.Params("id")
    
    // Use permission service to get effective permissions
    permissions, err := h.permissionService.GetUserPermissionsDetailed(c.Context(), userID)
    if err != nil {
        logger.Error("Fout bij ophalen user permissions", "error", err, "user_id", userID)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon user permissions niet ophalen",
        })
    }
    
    return c.JSON(permissions)
}

// Toevoegen aan RegisterRoutes:
app.Get("/api/users/:id/permissions", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "read"), 
    h.GetUserPermissions
)
```

**Permission Service Method**:
```go
// In permission_service.go
type UserPermissionDetail struct {
    UserID               string    `json:"user_id"`
    Email                string    `json:"email"`
    RoleName             string    `json:"role_name"`
    Resource             string    `json:"resource"`
    Action               string    `json:"action"`
    PermissionAssignedAt time.Time `json:"permission_assigned_at"`
    RoleAssignedAt       time.Time `json:"role_assigned_at"`
}

func (s *PermissionService) GetUserPermissionsDetailed(ctx context.Context, userID string) ([]UserPermissionDetail, error) {
    query := `
        SELECT 
            u.id as user_id,
            u.email,
            r.name as role_name,
            p.resource,
            p.action,
            rp.created_at as permission_assigned_at,
            ur.assigned_at as role_assigned_at
        FROM gebruikers u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = $1 
          AND ur.is_active = true
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        ORDER BY p.resource, p.action
    `
    
    var permissions []UserPermissionDetail
    err := s.db.WithContext(ctx).Raw(query, userID).Scan(&permissions).Error
    
    return permissions, err
}
```

---

## 📋 Complete Backend Wijzigingen Samenvatting

### user_handler.go Changes

```go
package handlers

import (
    "dklautomationgo/logger"
    "dklautomationgo/models"
    "dklautomationgo/repository"
    "dklautomationgo/services"
    "strconv"
    "strings"
    "time"

    "github.com/gofiber/fiber/v2"
    "gorm.io/gorm"
)

type UserHandler struct {
    authService       services.AuthService
    permissionService services.PermissionService
    userRoleRepo      repository.UserRoleRepository
    roleRepo          repository.RoleRepository  // ADD THIS
}

func NewUserHandler(
    authService services.AuthService, 
    permissionService services.PermissionService, 
    userRoleRepo repository.UserRoleRepository,
    roleRepo repository.RoleRepository,  // ADD THIS
) *UserHandler {
    return &UserHandler{
        authService:       authService,
        permissionService: permissionService,
        userRoleRepo:      userRoleRepo,
        roleRepo:          roleRepo,  // ADD THIS
    }
}

func (h *UserHandler) RegisterRoutes(app *fiber.App) {
    app.Get("/api/users", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "read"), h.ListUsers)
    app.Get("/api/users/:id", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "read"), h.GetUser)
    app.Post("/api/users", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "write"), h.CreateUser)
    app.Put("/api/users/:id", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "write"), h.UpdateUser)
    
    // RBAC User-Role Management
    app.Get("/api/users/:id/roles", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "read"), h.GetUserRoles)  // NEW
    app.Post("/api/users/:id/roles", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "manage_roles"), h.AssignRoleToUser)  // NEW (single)
    app.Put("/api/users/:id/roles", AuthMiddleware(h.authService), AdminPermissionMiddleware(h.permissionService), h.AssignRolesToUser)  // KEEP (bulk)
    app.Delete("/api/users/:id/roles/:roleId", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "manage_roles"), h.RemoveRoleFromUser)
    app.Get("/api/users/:id/permissions", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "read"), h.GetUserPermissions)  // NEW
    
    app.Delete("/api/users/:id", AuthMiddleware(h.authService), PermissionMiddleware(h.permissionService, "user", "delete"), h.DeleteUser)
}

// ADD: GetUserRoles - Get all roles for a user
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

// ADD: AssignRoleToUser - Assign single role to user
func (h *UserHandler) AssignRoleToUser(c *fiber.Ctx) error {
    userID := c.Params("id")
    
    var req struct {
        RoleID    string  `json:"role_id"`
        ExpiresAt *string `json:"expires_at,omitempty"`
    }
    
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Ongeldige gegevens",
        })
    }
    
    if req.RoleID == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Role ID is verplicht",
        })
    }
    
    currentUserID, _ := c.Locals("userID").(string)
    
    ur := &models.UserRole{
        UserID:     userID,
        RoleID:     req.RoleID,
        AssignedBy: &currentUserID,
        IsActive:   true,
    }
    
    if req.ExpiresAt != nil && *req.ExpiresAt != "" {
        t, err := time.Parse(time.RFC3339, *req.ExpiresAt)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "error": "Ongeldige expires_at formaat (gebruik RFC3339)",
            })
        }
        ur.ExpiresAt = &t
    }
    
    if err := h.userRoleRepo.Create(c.Context(), ur); err != nil {
        if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
            return c.Status(fiber.StatusConflict).JSON(fiber.Map{
                "error": "User heeft deze rol al",
            })
        }
        logger.Error("Fout bij toewijzen role", "error", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon role niet toewijzen",
        })
    }
    
    // Load full role object for response
    role, err := h.roleRepo.GetByID(c.Context(), req.RoleID)
    if err == nil {
        ur.Role = *role
    }
    
    return c.Status(fiber.StatusCreated).JSON(ur)
}

// ADD: GetUserPermissions - Get effective permissions for user
func (h *UserHandler) GetUserPermissions(c *fiber.Ctx) error {
    userID := c.Params("id")
    
    permissions, err := h.permissionService.GetUserPermissionsDetailed(c.Context(), userID)
    if err != nil {
        logger.Error("Fout bij ophalen user permissions", "error", err, "user_id", userID)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Kon user permissions niet ophalen",
        })
    }
    
    return c.JSON(permissions)
}

// KEEP EXISTING: AssignRolesToUser (bulk operation)
// KEEP EXISTING: RemoveRoleFromUser
// ... rest blijft hetzelfde
```

### repository/user_role_repository.go Changes

```go
// ADD this method:
func (r *UserRoleRepository) GetByUserIDWithRoles(ctx context.Context, userID string) ([]models.UserRole, error) {
    var userRoles []models.UserRole
    
    err := r.db.WithContext(ctx).
        Preload("Role").
        Preload("Role.Permissions").
        Where("user_id = ?", userID).
        Where("is_active = ?", true).
        Where("expires_at IS NULL OR expires_at > ?", time.Now()).
        Order("assigned_at DESC").
        Find(&userRoles).Error
    
    return userRoles, err
}
```

### services/permission_service.go Changes

```go
// ADD this type and method:
type UserPermissionDetail struct {
    UserID               string    `json:"user_id"`
    Email                string    `json:"email"`
    RoleName             string    `json:"role_name"`
    Resource             string    `json:"resource"`
    Action               string    `json:"action"`
    PermissionAssignedAt time.Time `json:"permission_assigned_at"`
    RoleAssignedAt       time.Time `json:"role_assigned_at"`
}

func (s *PermissionService) GetUserPermissionsDetailed(ctx context.Context, userID string) ([]UserPermissionDetail, error) {
    query := `
        SELECT 
            u.id as user_id,
            u.email,
            r.name as role_name,
            p.resource,
            p.action,
            rp.created_at as permission_assigned_at,
            ur.assigned_at as role_assigned_at
        FROM gebruikers u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = $1 
          AND ur.is_active = true
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        ORDER BY p.resource, p.action
    `
    
    var permissions []UserPermissionDetail
    err := s.db.WithContext(ctx).Raw(query, userID).Scan(&permissions).Error
    
    return permissions, err
}
```

---

## 🎯 Impact Analysis

### Zonder Deze Endpoints:

❌ **UserRoleAssignmentModal** - Kan user roles niet laden (GET ontbreekt)  
❌ **UserRoleAssignmentModal** - Kan single role niet toewijzen (POST ontbreekt)  
⚠️ **BulkRoleOperations** - Werkt niet correct (gebruikt POST maar backend heeft PUT)  
⚠️ **Permission auditing** - Kan detailed permissions niet ophalen  

### Met Deze Endpoints:

✅ **Complete RBAC functionaliteit**  
✅ **User role management werkt**  
✅ **Bulk operations werken**  
✅ **Permission auditing mogelijk**  
✅ **Frontend volledig functioneel**  

---

## ✅ Verificatie Checklist

Na backend implementatie:

- [ ] Test: GET /api/users/:id/roles retourneert user roles array
- [ ] Test: POST /api/users/:id/roles met single role_id werkt
- [ ] Test: GET /api/users/:id/permissions retourneert permission details
- [ ] Test: UserRoleAssignmentModal opent zonder errors
- [ ] Test: Toggle role switches werken in modal
- [ ] Test: Bulk role assignment werkt correct
- [ ] Verify: Geen "Method Not Allowed" errors in logs
- [ ] Verify: Frontend en backend volledig gesynchroniseerd

---

**Prioriteit Volgorde**:
1. 🔴 **CRITICAL**: GET /api/users/:id/roles + POST /api/users/:id/roles
2. 🟡 **MEDIUM**: GET /api/users/:id/permissions
3. 🟢 **LOW**: Andere RBAC endpoints (als die ook ontbreken)

---

**Versie**: 1.0  
**Datum**: 2025-11-02  
**Status**: Backend Implementatie Vereist