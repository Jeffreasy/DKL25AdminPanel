# 🔴 Backend-Frontend Integration Issues

> **Datum:** 2025-11-02  
> **Status:** 🔴 Critical Issues  
> **Priority:** High

---

## 📋 Overzicht

De frontend is volledig geïmplementeerd volgens V1.49 specifications, maar er zijn **twee kritieke backend issues** die de RBAC functionaliteit blokkeren.

---

## 🔴 Issue 1: Backend 500 Error - User Roles Endpoints

### Symptomen
```
GET /api/users/{userId}/roles → 500 Internal Server Error
POST /api/users/{userId}/roles → 500 Internal Server Error
```

### Backend Handler Code (Correct)

De handler code is correct geïmplementeerd:

```go
// handlers/user_handler.go
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

### Root Cause Analysis

Het probleem zit NIET in de handler, maar in één van de volgende lagen:

#### 1. Database Schema
**Mogelijke Issue:** `user_roles` table bestaat niet of heeft verkeerde schema

**Check:**
```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_roles';

-- Check schema
DESCRIBE user_roles;

-- Expected schema:
-- id (UUID, PRIMARY KEY)
-- user_id (UUID, FOREIGN KEY → users.id)
-- role_id (UUID, FOREIGN KEY → rbac_roles.id)
-- assigned_by (UUID, NULLABLE)
-- assigned_at (TIMESTAMP)
-- is_active (BOOLEAN, DEFAULT true)
-- expires_at (TIMESTAMP, NULLABLE)
-- created_at, updated_at, deleted_at
```

#### 2. Repository Method
**Mogelijke Issue:** `GetByUserIDWithRoles()` heeft bug of query faalt

**Location:** `repository/user_role_repository.go`

**Check:**
```go
func (r *UserRoleRepositoryImpl) GetByUserIDWithRoles(ctx context.Context, userID string) ([]*models.UserRole, error) {
    var userRoles []*models.UserRole
    
    // Check if this query is correct:
    err := r.db.WithContext(ctx).
        Preload("Role").                    // ← Loads the Role relation
        Preload("Role.Permissions").        // ← Loads permissions
        Where("user_id = ? AND is_active = ?", userID, true).
        Find(&userRoles).Error
    
    return userRoles, err
}
```

**Potential Issues:**
- Foreign key constraints falen
- Preload relations zijn incorrect
- Index missing op `user_id` kolom
- `is_active` filter geeft geen results

#### 3. Permission Middleware
**Mogelijke Issue:** Middleware blokkeert request

**Current Route:**
```go
app.Get("/api/users/:id/roles", 
    AuthMiddleware(h.authService), 
    PermissionMiddleware(h.permissionService, "user", "read"),  // ← Check dit
    h.GetUserRoles)
```

**Check:**
- Heeft admin account `user:read` permission?
- Is permission caching correct?
- Zijn er RBAC validatie errors?

### Oplossing

1. **Check Backend Logs:**
   ```bash
   # Find exact error in logs
   grep "Fout bij ophalen user roles" logs/app.log
   
   # Check database errors
   grep "database\|sql\|gorm" logs/app.log
   ```

2. **Test Repository Direct:**
   ```go
   // Add debug logging in repository
   func (r *UserRoleRepositoryImpl) GetByUserIDWithRoles(ctx context.Context, userID string) ([]*models.UserRole, error) {
       logger.Debug("GetByUserIDWithRoles called", "user_id", userID)
       
       var userRoles []*models.UserRole
       err := r.db.WithContext(ctx).
           Preload("Role").
           Preload("Role.Permissions").
           Where("user_id = ? AND is_active = ?", userID, true).
           Find(&userRoles).Error
       
       if err != nil {
           logger.Error("Database query failed", 
               "error", err, 
               "user_id", userID,
               "sql_error", err.Error())  // ← Full SQL error
       }
       
       logger.Debug("Found user roles", "count", len(userRoles))
       return userRoles, err
   }
   ```

3. **Test Database Direct:**
   ```sql
   -- Test if user_roles table is accessible
   SELECT * FROM user_roles WHERE user_id = '01f63c58-2311-41ff-94ba-b727437ee555';
   
   -- Test joins work
   SELECT ur.*, r.name, r.description 
   FROM user_roles ur
   JOIN rbac_roles r ON ur.role_id = r.id
   WHERE ur.user_id = '01f63c58-2311-41ff-94ba-b727437ee555'
   AND ur.is_active = true;
   ```

---

## 🔴 Issue 2: Backend Error Format Inconsistent met V1.49

### Probleem

Backend V1.49 documentatie specificeert **machine-readable error codes**, maar de handler implementatie gebruikt deze NIET.

### V1.49 Specification (Docs)

Volgens [`RBAC_SECURITY_FIXES_IMPLEMENTATION.md`](../backend/docs/RBAC_SECURITY_FIXES_IMPLEMENTATION.md):

```go
// V1.49 SPEC: Error responses should include machine-readable code
return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
    "error": "Niet geautoriseerd",
    "code":  "UNAUTHORIZED",  // ✅ Machine-readable code
})
```

### Huidige Backend Implementatie

```go
// handlers/user_handler.go (CURRENT)
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
    "error": "Kon user roles niet ophalen",  // ✅ Has error message
    // ❌ MISSING: "code": "INTERNAL_ERROR"
})

// handlers/user_handler.go - AssignRoleToUser
return c.Status(fiber.StatusConflict).JSON(fiber.Map{
    "error": "User heeft deze rol al",  // ✅ Has error message
    // ❌ MISSING: "code": "DUPLICATE_ROLE"
})

// handlers/user_handler.go - RemoveRoleFromUser
return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
    "error": "Gebruiker heeft deze rol niet",  // ✅ Has error message
    // ❌ MISSING: "code": "ROLE_NOT_FOUND"
})
```

### Impact

**Frontend V1.49 Implementation:**
- ✅ Frontend IS geïmplementeerd met error code support
- ✅ Frontend verwacht `{ error: string, code: string }` format
- ❌ Backend stuurt geen `code` field
- ⚠️ Frontend valt terug op `HTTP_{status}` als code ontbreekt

**Current Behavior:**
```typescript
// Frontend receives:
{
  error: "Kon user roles niet ophalen"
  // code field missing!
}

// Frontend fallback (in apiErrorHandler.ts):
throw new ApiError(
  {
    error: "Kon user roles niet ophalen",
    code: "HTTP_500"  // ← Generated by frontend
  },
  500
)
```

### Oplossing: Backend Handlers Updaten

Alle error responses in `user_handler.go` moeten updaten:

```go
// ❌ VOOR
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
    "error": "Kon user roles niet ophalen",
})

// ✅ NA
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
    "error": "Kon user roles niet ophalen",
    "code":  "INTERNAL_ERROR",
})

// ❌ VOOR
return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
    "error": "Role ID is verplicht",
})

// ✅ NA
return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
    "error": "Role ID is verplicht",
    "code":  "MISSING_ROLE_ID",
})

// ❌ VOOR
return c.Status(fiber.StatusConflict).JSON(fiber.Map{
    "error": "User heeft deze rol al",
})

// ✅ NA
return c.Status(fiber.StatusConflict).JSON(fiber.Map{
    "error": "User heeft deze rol al",
    "code":  "DUPLICATE_ROLE",
})

// ❌ VOOR
return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
    "error": "Gebruiker heeft deze rol niet",
})

// ✅ NA
return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
    "error": "Gebruiker heeft deze rol niet",
    "code":  "ROLE_NOT_FOUND",
})
```

### Recommended Error Codes

| HTTP Status | Error Message | Recommended Code |
|-------------|--------------|------------------|
| 400 | Ongeldige gegevens | `INVALID_INPUT` |
| 400 | Role ID is verplicht | `MISSING_ROLE_ID` |
| 400 | User ID is verplicht | `MISSING_USER_ID` |
| 401 | Niet geautoriseerd | `UNAUTHORIZED` |
| 403 | Geen toegang | `FORBIDDEN` |
| 404 | User not found | `USER_NOT_FOUND` |
| 404 | Gebruiker heeft deze rol niet | `ROLE_NOT_FOUND` |
| 409 | User heeft deze rol al | `DUPLICATE_ROLE` |
| 500 | Kon user roles niet ophalen | `INTERNAL_ERROR` |
| 500 | Kon role niet toewijzen | `ASSIGNMENT_FAILED` |
| 500 | Kon rol niet verwijderen | `REMOVAL_FAILED` |

---

## ✅ Frontend Status

### Frontend is Volledig Correct Geïmplementeerd

De frontend V1.49 implementatie is **100% compleet** en volgt exact de specs:

#### 1. Type Definitions ✅
```typescript
// User interface met roles array (primary)
interface User {
  role?: string        // DEPRECATED - backward compat
  roles: Role[]        // PRIMARY - as per V1.49
  permissions: Permission[]
}
```

#### 2. Error Handling ✅
```typescript
// apiErrorHandler.ts - Supports machine-readable codes
export interface ApiErrorResponse {
  error: string
  code: string  // Machine-readable code
  details?: Record<string, unknown>
}

// Fallback when backend doesn't provide code
throw new ApiError(
  {
    error: response.statusText,
    code: `HTTP_${response.status}`  // Fallback
  },
  response.status
)
```

#### 3. Component Error UI ✅
```typescript
// UserRoleAssignmentModal.tsx
{userRolesError && (
  <div className="error-ui">
    <h4>Backend Error ({status})</h4>
    <p>Error: {getErrorMessage(error)}</p>
    <p>Code: {getErrorCode(error) || 'HTTP_500'}</p>
    <details>Technical details for debugging</details>
  </div>
)}
```

### Frontend Werkt Correct Zodra Backend Gefixed Is

Zodra backend issues zijn opgelost:
- ✅ Frontend kan roles ophalen
- ✅ Frontend kan roles toewijzen
- ✅ Frontend toont error codes (als backend ze stuurt)
- ✅ Frontend valt terug op HTTP codes (als backend ze niet stuurt)

---

## 🔧 Action Items

### Critical - Backend Fixes (Priority 1)

1. **Fix 500 Error** ⚠️ BLOCKER
   - [ ] Check backend logs voor exacte error
   - [ ] Verify `user_roles` table exists en correct schema heeft
   - [ ] Test `GetByUserIDWithRoles()` repository method
   - [ ] Check permission middleware niet blokkeert
   - [ ] Test database queries direct

2. **Add Error Codes** ⚠️ HIGH
   - [ ] Update alle error responses in `user_handler.go`
   - [ ] Add `code` field to alle error responses
   - [ ] Use consistent error code naming
   - [ ] Document error codes

### Nice to Have - Backend Improvements (Priority 2)

3. **Enhance Error Logging**
   - [ ] Add structured logging met error codes
   - [ ] Log full SQL errors bij database failures
   - [ ] Add request ID tracing

4. **Add Integration Tests**
   - [ ] Test role assignment flow end-to-end
   - [ ] Test error responses include codes
   - [ ] Test permission middleware

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Frontend V1.49** | ✅ Complete | All specs implemented |
| **Frontend Error Handling** | ✅ Complete | Supports codes + fallback |
| **Backend Handlers** | ⚠️ Incomplete | Missing error codes |
| **Backend Repository** | 🔴 Failing | 500 errors |
| **Database Schema** | ❓ Unknown | Needs verification |
| **Integration** | 🔴 Blocked | Backend 500 errors |

---

## 🎯 Next Steps

1. **Backend Developer:**
   - Check logs → Find root cause of 500 error
   - Fix database/repository issue
   - Add error codes to all responses

2. **Frontend Developer:**
   - ✅ Implementation complete
   - Wait for backend fixes
   - Test integration when backend ready

3. **Testing:**
   - Manual test role assignment flow
   - Verify error codes in responses
   - Test error UI displays correctly

---

**Last Updated:** 2025-11-02  
**Status:** Frontend Ready ✅ | Backend Blocked 🔴  
**Priority:** Critical - Blocks RBAC functionality