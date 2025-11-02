# 🔄 Frontend Migration Guide - V1.49

> **Versie:** 1.49.0  
> **Datum:** 2025-11-02  
> **Type:** Breaking Changes  
> **Status:** ✅ Geïmplementeerd

---

## 📋 Overzicht

Dit document beschrijft alle frontend wijzigingen die nodig zijn om te werken met de backend V1.49 security updates. De belangrijkste wijziging is de **deprecation van het legacy `rol` (string) field** ten gunste van een **`roles` array** voor RBAC.

---

## 🔴 Breaking Changes

### 1. Login/Profile API Response Structure

#### ❌ VOOR (Legacy)
```typescript
// Login/Profile response
{
  user: {
    id: "123",
    email: "user@example.com",
    naam: "Jan Jansen",
    rol: "admin",  // ❌ String field - DEPRECATED
    permissions: [
      { resource: "users", action: "read" }
    ]
  }
}
```

#### ✅ NA (V1.49)
```typescript
// Login/Profile response
{
  user: {
    id: "123",
    email: "user@example.com",
    naam: "Jan Jansen",
    // ❌ rol field is REMOVED from API responses
    roles: [  // ✅ Array of role objects - PRIMARY
      { 
        id: "role-uuid",
        name: "admin",
        description: "Administrator role"
      }
    ],
    permissions: [
      { resource: "users", action: "read" }
    ]
  }
}
```

### 2. JWT Token Claims

#### ❌ VOOR (Legacy)
```typescript
// JWT payload
{
  email: "user@example.com",
  role: "admin",      // From database 'rol' field
  roles: ["admin"],   // From RBAC
  rbac_active: true
}
```

#### ✅ NA (V1.49)
```typescript
// JWT payload
{
  email: "user@example.com",
  role: "admin",      // DEPRECATED - first role from roles array (backward compat)
  roles: ["admin"],   // ✅ PRIMARY - use this
  rbac_active: true
}
```

### 3. Error Response Structure

#### ❌ VOOR (Legacy)
```typescript
// Error response
{
  error: "Geen toegang"
}
```

#### ✅ NA (V1.49)
```typescript
// Error response with machine-readable code
{
  error: "Geen toegang tot deze resource",
  code: "FORBIDDEN"  // ✅ Machine-readable
}

// Permission error with details
{
  error: "Onvoldoende rechten",
  code: "PERMISSION_DENIED",
  details: {
    required_permission: "users:delete",
    user_permissions: ["users:read", "users:update"]
  }
}
```

---

## 🔧 Frontend Updates Geïmplementeerd

### 1. Type Definitions

#### [`src/features/auth/contexts/AuthContext.ts`](../src/features/auth/contexts/AuthContext.ts)
```typescript
export interface User {
  id: string
  email: string | undefined
  // DEPRECATED: Legacy field - will be removed in future version
  // Use roles array instead
  role?: string
  // RBAC roles - primary source
  roles: Array<{ id: string; name: string; description?: string }>
  permissions?: Permission[]
  metadata?: Record<string, unknown>
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: unknown
  }
}
```

#### [`src/features/users/types.ts`](../src/features/users/types.ts)
```typescript
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
```

### 2. AuthProvider Updates

#### [`src/features/auth/contexts/AuthProvider.tsx`](../src/features/auth/contexts/AuthProvider.tsx)

**Belangrijke wijzigingen:**
- Backend `rol` field is verwijderd uit responses
- `roles` array is nu de PRIMARY bron
- Legacy `role` field wordt afgeleid van eerste role in array (voor backward compatibility)

```typescript
// Profile loading
const userData = await response.json();
const roles = userData.roles || []; // RBAC roles array - PRIMARY

// Legacy role field: use first role name (DEPRECATED)
const legacyRole = roles.length > 0 ? roles[0].name : undefined;

setUser({
  id: userData.id,
  email: userData.email,
  role: legacyRole,  // DEPRECATED - only for backward compatibility
  roles,             // PRIMARY source
  permissions,
  user_metadata: { full_name: userData.naam || userData.name }
});
```

### 3. Error Handling Improvements

#### [`src/utils/apiErrorHandler.ts`](../src/utils/apiErrorHandler.ts)

**Nieuwe features:**
- Support voor machine-readable error codes
- Structured error responses
- Enhanced permission error handling
- Helper functies voor error handling

```typescript
// New error classes
export class ApiError extends Error {
  public code: string
  public status: number
  public details?: Record<string, unknown>
}

export class ApiPermissionError extends ApiError {
  public requiredPermission: string
  public userPermissions: string[]
}

// Helper functions
export function getErrorMessage(error: unknown): string
export function getErrorCode(error: unknown): string | undefined
export function isApiError(error: unknown): error is ApiError
```

---

## 📝 Migratie Stappen

### Stap 1: Update Types

Als je eigen types hebt die user data gebruiken:

```typescript
// ❌ VOOR
interface MyComponent {
  role: string
}

// ✅ NA
interface MyComponent {
  roles: Array<{ id: string; name: string; description?: string }>
}
```

### Stap 2: Update Component Code

Als je componenten `user.role` gebruiken:

```typescript
// ❌ VOOR
const isAdmin = user.role === 'admin';

// ✅ NA - Optie 1: Check eerste role (eenvoudig)
const isAdmin = user.roles?.[0]?.name === 'admin';

// ✅ NA - Optie 2: Check of role in array zit (robuust)
const isAdmin = user.roles?.some(role => role.name === 'admin');

// ✅ NA - Optie 3: Check of gebruiker specifieke role heeft (beste)
const hasRole = (roleName: string) => 
  user.roles?.some(role => role.name === roleName) ?? false;

const isAdmin = hasRole('admin');
```

### Stap 3: Update Error Handling

```typescript
// ❌ VOOR
try {
  await api.deleteUser(id);
} catch (error) {
  toast.error(error.message);
}

// ✅ NA - Met error code support
import { getErrorMessage, getErrorCode, isPermissionError } from '@/utils/apiErrorHandler';

try {
  await api.deleteUser(id);
} catch (error) {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  
  if (isPermissionError(error)) {
    toast.error(
      `Geen toestemming: ${error.requiredPermission} vereist`
    );
  } else {
    toast.error(message);
  }
  
  // Log code voor debugging
  console.error('Error code:', code);
}
```

### Stap 4: Update API Calls

Voor forms die gebruikers aanmaken/updaten:

```typescript
// ❌ VOOR
const createUser = async (data: CreateUserRequest) => {
  return api.post('/users', {
    ...data,
    rol: 'gebruiker'  // Legacy string
  });
};

// ✅ NA - Met RBAC
const createUser = async (data: CreateUserRequest) => {
  return api.post('/users', {
    ...data,
    role_ids: ['role-uuid-for-gebruiker']  // RBAC array
  });
};
```

---

## 🧪 Testing Checklist

Voordat je wijzigingen deploy:

- [ ] **Login test**
  - [ ] Login succesvol met nieuwe response structure
  - [ ] `user.roles` array bevat correcte roles
  - [ ] `user.permissions` array werkt correct
  - [ ] Legacy `user.role` bevat eerste role naam (fallback)

- [ ] **Profile loading**
  - [ ] Profile endpoint retourneert `roles` array
  - [ ] Geen `rol` field in response (deprecated)
  - [ ] Permissions worden correct geladen

- [ ] **Role checks**
  - [ ] Admin check werkt: `user.roles?.some(r => r.name === 'admin')`
  - [ ] Multiple role checks werken correct
  - [ ] Components die `user.role` gebruiken zijn geüpdatet

- [ ] **Error handling**
  - [ ] Permission errors tonen correct bericht
  - [ ] Error codes worden gelogd
  - [ ] Machine-readable codes werken

- [ ] **User management**
  - [ ] Gebruiker aanmaken met `role_ids` array werkt
  - [ ] Gebruiker updaten met roles werkt
  - [ ] Bulk role operations werken

---

## 🚨 Veelvoorkomende Problemen

### Probleem 1: `user.role is undefined`

**Oorzaak:** Backend stuurt geen `rol` field meer

**Oplossing:**
```typescript
// ❌ VERKEERD
if (user.role === 'admin') { ... }

// ✅ GOED
if (user.roles?.some(r => r.name === 'admin')) { ... }
```

### Probleem 2: Forms falen bij gebruiker aanmaken

**Oorzaak:** Backend accepteert geen `rol` string meer

**Oplossing:**
```typescript
// ❌ VERKEERD
{ rol: 'admin' }

// ✅ GOED
{ role_ids: ['admin-role-uuid'] }
```

### Probleem 3: Error messages onduidelijk

**Oorzaak:** Nieuwe error structure niet gebruikt

**Oplossing:**
```typescript
// ❌ VERKEERD
catch (error) {
  alert(error.message);
}

// ✅ GOED
import { getErrorMessage, getErrorCode } from '@/utils/apiErrorHandler';

catch (error) {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  toast.error(message);
  console.error('Error code:', code);
}
```

---

## 📊 Backward Compatibility

### Wat werkt nog steeds?

1. **JWT Token `role` field** (DEPRECATED)
   - Bevat eerste role naam voor backward compatibility
   - Gebruik `roles` array in plaats daarvan

2. **User type `role` field** (DEPRECATED)
   - Optioneel field voor legacy code
   - Wordt afgeleid van eerste role in `roles` array

### Wat gaat in de toekomst weg?

1. **User.role field** - Wordt verwijderd in volgende major versie
2. **JWT.role field** - Wordt verwijderd wanneer alle clients geüpdatet zijn
3. **rol parameter in API calls** - Gebruik `role_ids` array

---

## 🎯 Best Practices

### 1. Role Checks
```typescript
// ❌ SLECHT - Alleen eerste role
const isAdmin = user.roles?.[0]?.name === 'admin';

// ✅ GOED - Check alle roles
const hasRole = (roleName: string) =>
  user.roles?.some(role => role.name === roleName) ?? false;

const isAdmin = hasRole('admin');
const isStaff = hasRole('staff');
const canManageUsers = hasRole('admin') || hasRole('user_manager');
```

### 2. Permission Checks
```typescript
// ✅ GOED - Gebruik de usePermissions hook
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission } = usePermissions();
  
  if (hasPermission('users', 'delete')) {
    // User can delete
  }
}
```

### 3. Error Handling
```typescript
// ✅ GOED - Structured error handling
import { 
  getErrorMessage, 
  getErrorCode, 
  isPermissionError,
  isApiError 
} from '@/utils/apiErrorHandler';

try {
  await apiCall();
} catch (error) {
  if (isPermissionError(error)) {
    console.error('Permission denied:', {
      required: error.requiredPermission,
      current: error.userPermissions
    });
    toast.error('Onvoldoende rechten');
  } else if (isApiError(error)) {
    console.error('API error:', error.code);
    toast.error(error.message);
  } else {
    toast.error(getErrorMessage(error));
  }
}
```

### 4. User Creation/Update
```typescript
// ✅ GOED - Gebruik RBAC role_ids
const createUser = async (formData: UserFormData) => {
  // Get role IDs from role selector
  const roleIds = formData.selectedRoles.map(r => r.id);
  
  return api.post('/users', {
    email: formData.email,
    naam: formData.naam,
    role_ids: roleIds,  // RBAC
    password: formData.password,
    is_actief: formData.isActive,
    newsletter_subscribed: formData.newsletterSubscribed
  });
};
```

---

## 📚 Referenties

### Gerelateerde Documenten
- [Backend RBAC Implementation](./architecture/backend/AUTH_AND_RBAC.md)
- [Frontend RBAC Implementation](./architecture/frontend-rbac-implementation.md)
- [Backend V1.49 Security Fixes](../backend/docs/RBAC_SECURITY_FIXES_IMPLEMENTATION.md)

### API Endpoints
- `POST /api/auth/login` - Returns roles array
- `GET /api/auth/profile` - Returns roles array
- `GET /api/users/:id/roles` - Get user's RBAC roles
- `POST /api/users/:id/roles` - Assign role to user
- `DELETE /api/users/:id/roles/:roleId` - Remove role from user

---

## ✅ Deployment Checklist

Voordat je deployed naar productie:

- [ ] Alle types zijn geüpdatet
- [ ] Components gebruiken `roles` array
- [ ] Error handling gebruikt nieuwe structure
- [ ] Tests zijn geüpdatet en slagen
- [ ] JWT token parsing werkt met nieuwe claims
- [ ] User creation/update gebruikt `role_ids`
- [ ] Backward compatibility is getest
- [ ] Documentation is geüpdatet

---

**Versie:** 1.49.0  
**Datum:** 2025-11-02  
**Auteur:** Development Team  
**Status:** ✅ Production Ready