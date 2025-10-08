# Frontend RBAC Implementation Guide

## Overzicht

Dit document beschrijft de implementatie van Role-Based Access Control (RBAC) in de DKL Admin Panel frontend, volledig afgestemd op de backend RBAC architectuur.

## 🏗️ Architectuur

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
│  • ProtectedRoute (route-level protection)             │
│  • AuthGuard (layout-level protection)                 │
│  • Conditional rendering (UI-level protection)         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  React Hooks & Context                   │
│  • useAuth() - Authentication state                     │
│  • usePermissions() - Permission checks                 │
│  • AuthContext - Global auth state                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    Services Layer                        │
│  • authManager - JWT token management                   │
│  • userService - User CRUD operations                   │
│  • roleService - Role management                        │
│  • permissionService - Permission management            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Fiber + Redis)                 │
│  • JWT Authentication                                    │
│  • Permission Middleware                                 │
│  • Redis Caching                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔑 Kern Componenten

### 1. AuthProvider (`src/contexts/auth/AuthProvider.tsx`)

Centraal authenticatie beheer met automatische token refresh.

**Functionaliteit:**
- JWT token opslag in localStorage
- Automatische token expiratie controle
- Token refresh mechanisme
- User profile laden met permissies
- Automatische logout bij 401 responses

**Gebruik:**
```tsx
import { AuthProvider } from './contexts/auth/AuthProvider'

function App() {
  return (
    <AuthProvider>
      {/* Your app */}
    </AuthProvider>
  )
}
```

### 2. useAuth Hook (`src/contexts/auth/useAuth.ts`)

Hook voor toegang tot authenticatie state.

**API:**
```typescript
const {
  user,              // User object met permissions
  loading,           // Loading state
  isAuthenticated,   // Boolean
  login,            // (email, password) => Promise
  logout,           // () => Promise
  loadUserProfile   // () => Promise
} = useAuth()
```

**User Object Structure:**
```typescript
{
  id: string
  email: string
  role: string
  permissions: Array<{ resource: string; action: string }>
  user_metadata: {
    full_name: string
  }
}
```

### 3. usePermissions Hook (`src/hooks/usePermissions.ts`)

Hook voor permission checks in components.

**API:**
```typescript
const {
  hasPermission,      // (resource, action) => boolean
  hasAnyPermission,   // (...perms) => boolean
  hasAllPermissions,  // (...perms) => boolean
  permissions         // Array<string> (formatted as "resource:action")
} = usePermissions()
```

**Voorbeelden:**
```tsx
// Enkele permission check
if (hasPermission('contact', 'write')) {
  // Toon edit button
}

// Meerdere permissions (OR)
if (hasAnyPermission('contact:write', 'contact:delete')) {
  // Toon actions menu
}

// Meerdere permissions (AND)
if (hasAllPermissions('user:read', 'user:manage_roles')) {
  // Toon role management
}
```

## 🛡️ Route Protection

### ProtectedRoute Component

Bescherm routes op basis van permissies.

**Gebruik:**
```tsx
import { ProtectedRoute } from './components/auth/ProtectedRoute'

<Route 
  path="/contacts" 
  element={
    <ProtectedRoute requiredPermission="contact:read">
      <ContactManager />
    </ProtectedRoute>
  } 
/>

// Zonder permission check (alleen authenticatie)
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### AuthGuard Component

Layout-level authenticatie check (geen permission check).

**Gebruik:**
```tsx
import { AuthGuard } from './components/auth/AuthGuard'

<Route 
  path="/" 
  element={
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  }
>
  {/* Nested routes */}
</Route>
```

## 🎨 UI-Level Permission Checks

### Conditional Rendering

```tsx
function ContactCard() {
  const { hasPermission } = usePermissions()

  return (
    <div>
      <h2>Contacten</h2>
      
      {hasPermission('contact', 'write') && (
        <button>Nieuw Contact</button>
      )}
      
      {hasPermission('contact', 'delete') && (
        <button>Verwijderen</button>
      )}
    </div>
  )
}
```

### Dashboard Example

```tsx
function Dashboard() {
  const { hasPermission, hasAnyPermission } = usePermissions()

  return (
    <div className="grid grid-cols-3 gap-4">
      {hasPermission('contact', 'read') && (
        <DashboardCard title="Contacten" />
      )}
      
      {hasPermission('user', 'read') && (
        <DashboardCard title="Gebruikers" />
      )}
      
      {hasPermission('admin', 'access') && (
        <DashboardCard title="Admin Panel" />
      )}
      
      {hasAnyPermission('photo:read', 'album:read') && (
        <DashboardCard title="Media" />
      )}
    </div>
  )
}
```

## 📋 Beschikbare Permissies

### Admin Permissies
- `admin:access` - Volledige admin toegang
- Alle onderstaande permissies

### Staff Permissies
- `staff:access` - Staff level toegang
- Contact, Aanmelding, Newsletter, Email (read/write)
- Chat (read/write/moderate)
- Photo, Album, Partner, Sponsor, Video (read/write/delete)

### Contact Management
- `contact:read` - Contactformulieren bekijken
- `contact:write` - Contactformulieren bewerken
- `contact:delete` - Contactformulieren verwijderen

### Aanmeldingen
- `aanmelding:read` - Aanmeldingen bekijken
- `aanmelding:write` - Aanmeldingen bewerken
- `aanmelding:delete` - Aanmeldingen verwijderen

### Nieuwsbrieven
- `newsletter:read` - Nieuwsbrieven bekijken
- `newsletter:write` - Nieuwsbrieven aanmaken/bewerken
- `newsletter:send` - Nieuwsbrieven verzenden
- `newsletter:delete` - Nieuwsbrieven verwijderen

### Email Management
- `email:read` - Emails bekijken
- `email:write` - Emails bewerken
- `email:delete` - Emails verwijderen
- `email:fetch` - Nieuwe emails ophalen

### Gebruikersbeheer
- `user:read` - Gebruikers bekijken
- `user:write` - Gebruikers aanmaken/bewerken
- `user:delete` - Gebruikers verwijderen
- `user:manage_roles` - Gebruikersrollen beheren

### Chat
- `chat:read` - Chat kanalen bekijken
- `chat:write` - Berichten verzenden
- `chat:manage_channel` - Kanalen beheren
- `chat:moderate` - Berichten modereren

### Media Management
- `photo:read`, `photo:write`, `photo:delete`
- `album:read`, `album:write`, `album:delete`
- `video:read`, `video:write`, `video:delete`

### Partners & Sponsors
- `partner:read`, `partner:write`, `partner:delete`
- `sponsor:read`, `sponsor:write`, `sponsor:delete`

### Admin Email
- `admin_email:send` - Emails verzenden namens admin

## 🔧 Services

### User Service (`src/features/users/services/userService.ts`)

```typescript
// Gebruikers ophalen
const users = await userService.getUsers(limit, offset)

// Gebruiker aanmaken
const user = await userService.createUser({
  email: 'user@example.com',
  naam: 'Naam',
  rol: 'staff',
  password: 'wachtwoord',
  is_actief: true,
  newsletter_subscribed: false
})

// Gebruiker updaten
await userService.updateUser(userId, { naam: 'Nieuwe Naam' })

// Gebruiker verwijderen
await userService.deleteUser(userId)
```

### Role Service (`src/features/users/services/roleService.ts`)

```typescript
// Rollen ophalen
const roles = await roleService.getRoles()

// Rol aanmaken
const role = await roleService.createRole({
  name: 'editor',
  description: 'Content editor rol'
})

// Permissies toewijzen aan rol (bulk)
await roleService.assignPermissionsToRole(roleId, [permId1, permId2])

// Enkele permissie toevoegen
await roleService.addPermissionToRole(roleId, permissionId)

// Permissie verwijderen
await roleService.removePermissionFromRole(roleId, permissionId)

// Rollen toewijzen aan gebruiker
await roleService.assignRolesToUser(userId, [roleId1, roleId2])
```

### Permission Service (`src/features/users/services/permissionService.ts`)

```typescript
// Permissies ophalen
const permissions = await permissionService.getPermissions()

// Permissie aanmaken
const permission = await permissionService.createPermission({
  resource: 'document',
  action: 'read',
  description: 'Documenten bekijken'
})

// Permissie updaten
await permissionService.updatePermission(permId, { description: 'Nieuwe beschrijving' })

// Permissie verwijderen
await permissionService.deletePermission(permId)
```

## 🚀 Best Practices

### 1. Defense in Depth
Implementeer permissie checks op meerdere niveaus:
- Route level (ProtectedRoute)
- Component level (conditional rendering)
- API level (backend middleware)

### 2. Graceful Degradation
```tsx
function ContactList() {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission('contact', 'write')
  const canDelete = hasPermission('contact', 'delete')

  return (
    <div>
      {contacts.map(contact => (
        <ContactItem 
          key={contact.id}
          contact={contact}
          showEdit={canEdit}
          showDelete={canDelete}
        />
      ))}
    </div>
  )
}
```

### 3. Loading States
```tsx
function ProtectedPage() {
  const { isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingSkeleton />
  }
  
  return <PageContent />
}
```

### 4. Error Handling
```tsx
try {
  await userService.updateUser(userId, data)
} catch (error) {
  if (error.message.includes('403')) {
    // Geen permissie
    toast.error('Je hebt geen toestemming voor deze actie')
  } else if (error.message.includes('401')) {
    // Niet ingelogd - AuthProvider handelt dit af
  } else {
    toast.error('Er is een fout opgetreden')
  }
}
```

## 🔒 Security Considerations

1. **Token Storage**: JWT tokens worden opgeslagen in localStorage (niet in cookies vanwege CORS)
2. **Token Expiry**: Automatische refresh 5 minuten voor expiratie
3. **Logout on 401**: Automatische logout bij unauthorized responses
4. **Permission Caching**: Backend gebruikt Redis voor snelle permission checks
5. **HTTPS Only**: Gebruik altijd HTTPS in productie

## 📝 Migration Guide

### Van oude naar nieuwe RBAC:

1. **Update imports:**
```tsx
// Oud
import { useAuth } from './hooks/useAuth'

// Nieuw
import { useAuth } from './contexts/auth/useAuth'
import { usePermissions } from './hooks/usePermissions'
```

2. **Update permission checks:**
```tsx
// Oud
if (user.role === 'admin') { }

// Nieuw
if (hasPermission('admin', 'access')) { }
```

3. **Update routes:**
```tsx
// Oud
<Route path="/contacts" element={<ContactManager />} />

// Nieuw
<Route 
  path="/contacts" 
  element={
    <ProtectedRoute requiredPermission="contact:read">
      <ContactManager />
    </ProtectedRoute>
  } 
/>
```

## 🐛 Troubleshooting

### Permissies worden niet geladen
- Check of `/api/auth/profile` endpoint correct werkt
- Controleer browser console voor errors
- Verify JWT token in localStorage

### 401 Unauthorized errors
- Token mogelijk verlopen - refresh mechanisme zou dit moeten afhandelen
- Check of backend JWT_SECRET correct is geconfigureerd

### Permissie checks falen
- Verify dat backend de juiste permissies retourneert in profile endpoint
- Check rolePermissions.ts voor fallback permissies
- Gebruik browser DevTools om user.permissions te inspecteren

## 📚 Gerelateerde Documentatie

- Backend RBAC: `BACKEND_RBAC_IMPLEMENTATION.md`
- API Endpoints: `RBAC_BACKEND_INTEGRATION.md`
- Database Schema: Zie backend documentatie