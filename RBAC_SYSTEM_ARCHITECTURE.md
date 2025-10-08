# RBAC Systeem Architectuur - DKL Admin Panel

## 📋 Overzicht

Het DKL Admin Panel gebruikt een **volledig backend-gedreven RBAC systeem**. Alle permissies komen uit de backend database via PostgreSQL en Redis caching.

## 🏗️ Architectuur Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  AuthProvider (src/contexts/auth/AuthProvider.tsx) │    │
│  │                                                      │    │
│  │  1. Login → POST /api/auth/login                   │    │
│  │  2. Get Profile → GET /api/auth/profile            │    │
│  │     ↓                                               │    │
│  │  3. Receive: { permissions: [...] }                │    │
│  │     ↓                                               │    │
│  │  4. Store in user state                            │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                    │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  usePermissions Hook (src/hooks/usePermissions.ts) │    │
│  │                                                      │    │
│  │  • hasPermission(resource, action)                 │    │
│  │  • hasAnyPermission(...perms)                      │    │
│  │  • hasAllPermissions(...perms)                     │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                    │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  UI Components                                      │    │
│  │                                                      │    │
│  │  • ProtectedRoute (route protection)               │    │
│  │  • Conditional rendering (UI elements)             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Go Fiber)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Auth Endpoints                                     │    │
│  │                                                      │    │
│  │  POST /api/auth/login                              │    │
│  │  GET  /api/auth/profile                            │    │
│  │  POST /api/auth/refresh                            │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                    │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Permission Service (with Redis Cache)             │    │
│  │                                                      │    │
│  │  • GetUserPermissions(userID)                      │    │
│  │  • HasPermission(userID, resource, action)         │    │
│  │  • Cache: perm:{userID}:{resource}:{action}        │    │
│  │  • TTL: 10 minutes                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                    │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Database (PostgreSQL)                              │    │
│  │                                                      │    │
│  │  • users                                            │    │
│  │  • roles                                            │    │
│  │  • permissions                                      │    │
│  │  • user_roles                                       │    │
│  │  • role_permissions                                 │    │
│  │  • user_permissions VIEW                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Permissie Flow

### Normale Flow (Productie & Development)

```
1. User logt in
   ↓
2. Backend valideert credentials
   ↓
3. Backend genereert JWT token
   ↓
4. Frontend slaat token op in localStorage
   ↓
5. Frontend roept /api/auth/profile aan
   ↓
6. Backend haalt user + permissions op uit database
   ↓
7. Backend retourneert:
   {
     id: "uuid",
     email: "user@example.com",
     rol: "admin",
     permissions: [
       { resource: "contact", action: "read" },
       { resource: "contact", action: "write" },
       ...
     ]
   }
   ↓
8. Frontend slaat permissions op in user state
   ↓
9. usePermissions hook gebruikt deze permissions voor checks
```

### Error Flow (Backend Geen Permissions)

```
1. User logt in
   ↓
2. Backend retourneert GEEN of lege permissions array
   ↓
3. Frontend detecteert lege permissions
   ↓
4. Console error: "❌ Backend returned no permissions!"
   ↓
5. User heeft GEEN toegang tot protected features
   ↓
6. Admin moet permissions toewijzen via backend
```

## 📁 Bestandsstructuur

### Backend (Bron van Waarheid)

```
backend/
├── handlers/
│   ├── auth_handler.go          # Login, Profile endpoints
│   └── permission_middleware.go # Permission checks
├── services/
│   ├── auth_service.go          # JWT generatie
│   └── permission_service.go    # Permission logic + Redis cache
└── models/
    └── user.go                  # User, Role, Permission models
```

### Frontend

```
frontend/src/
├── contexts/auth/
│   ├── AuthProvider.tsx         # Backend permissions ophalen
│   └── AuthContext.ts           # Type definitions
├── hooks/
│   └── usePermissions.ts        # Permission check hooks
├── components/auth/
│   ├── ProtectedRoute.tsx       # Route protection
│   └── AuthGuard.tsx            # Layout protection
└── features/users/
    ├── services/
    │   ├── roleService.ts       # Role CRUD
    │   └── permissionService.ts # Permission CRUD
    └── components/
        ├── RoleList.tsx         # Role management UI
        └── PermissionList.tsx   # Permission management UI
```

## 🎯 Backend Permissions (Enige Systeem)

**Altijd Actief:**
- Productie omgeving
- Development omgeving
- Testing omgeving

**Voordelen:**
- ✅ Dynamisch - wijzigingen direct actief
- ✅ Centraal beheerd via Admin UI
- ✅ Redis caching voor performance
- ✅ Audit trail (wie, wanneer)
- ✅ Geen frontend deployment nodig voor wijzigingen
- ✅ Single source of truth
- ✅ Geen verwarring over welk systeem actief is

**Console Output:**

Bij Succes:
```javascript
✅ Backend permissions loaded: 15 permissions
```

Bij Fout (geen permissions):
```javascript
❌ Backend returned no permissions! User will have no access.
Please ensure the backend /api/auth/profile endpoint returns a permissions array.
```

## 🔧 Configuratie

### Backend Setup (Vereist)

1. **Database Migraties**
```sql
-- Zie: backend/migrations/
CREATE TABLE roles (...);
CREATE TABLE permissions (...);
CREATE TABLE role_permissions (...);
CREATE TABLE user_roles (...);
```

2. **Seed Data**
```sql
-- Basis rollen en permissies
INSERT INTO roles (name, description) VALUES 
  ('admin', 'Volledige toegang'),
  ('staff', 'Ondersteunend personeel'),
  ('user', 'Standaard gebruiker');

INSERT INTO permissions (resource, action, description) VALUES
  ('contact', 'read', 'Contactformulieren bekijken'),
  ('contact', 'write', 'Contactformulieren bewerken'),
  ...
```

3. **Environment Variables**
```env
JWT_SECRET=your-secret-key
JWT_TOKEN_EXPIRY=24h
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://...
```

### Frontend Setup

1. **Environment Variables**
```env
VITE_API_BASE_URL=https://api.dekoninklijkeloop.nl
```

2. **Geen verdere configuratie nodig** - gebruikt automatisch backend permissions

## 🐛 Troubleshooting

### Probleem: "Backend returned no permissions" 

**Oorzaak:** Backend retourneert geen of lege permissions array

**Oplossing:**
1. Check `/api/auth/profile` endpoint response format
2. Verify database heeft user_roles en role_permissions records
3. Check backend logs voor errors
4. Verify user heeft daadwerkelijk rollen toegewezen
5. Check Redis connectie werkt
6. Verify permission service logic in backend

### Probleem: User heeft geen toegang tot features

**Oorzaak:** Geen permissions toegewezen in backend

**Oplossing:**
1. Login als admin
2. Ga naar Admin - Permissies & Rollen
3. Wijs rollen toe aan gebruiker
4. Of: Wijs permissies toe aan rol
5. User moet opnieuw inloggen

### Probleem: Permissies werken niet na wijziging in Admin UI

**Oorzaak:** Redis cache nog niet geïnvalideerd

**Oplossing:**
1. Wacht 10 minuten (cache TTL)
2. Of: Logout en login opnieuw
3. Of: Backend cache invalidatie triggeren

## 📊 Monitoring

### Console Logs

**Bij Succesvolle Backend Integratie:**
```
✅ Backend permissions loaded: 15 permissions
```

**Bij Fout (Geen Permissions):**
```
❌ Backend returned no permissions! User will have no access.
Please ensure the backend /api/auth/profile endpoint returns a permissions array.
```

### Performance Metrics

- **Backend Permission Check**: ~1-5ms (met Redis cache)
- **Frontend Permission Check**: <1ms (in-memory)
- **Cache Hit Rate**: >95% (target)
- **Cache TTL**: 10 minuten

## 🔒 Security Considerations

### Backend (Primair)
- ✅ JWT token validatie
- ✅ Permission middleware op alle protected routes
- ✅ Redis cache voor performance
- ✅ Database audit trail
- ✅ System permissions kunnen niet verwijderd worden

### Frontend (Secundair)
- ⚠️ UI-level checks (niet security-critical)
- ⚠️ Kan omzeild worden via browser DevTools
- ⚠️ Alleen voor UX (tonen/verbergen UI elementen)
- ✅ Alle API calls worden gevalideerd door backend

**Belangrijk:** Frontend permission checks zijn ALLEEN voor UX. Backend MOET altijd valideren!

## 📝 Best Practices

### DO ✅

1. **Gebruik Backend Permissions**
   ```typescript
   // AuthProvider haalt automatisch backend permissions op
   const { hasPermission } = usePermissions();
   if (hasPermission('contact', 'write')) { ... }
   ```

2. **Implementeer Permission Checks op Beide Niveaus**
   ```typescript
   // Frontend (UX)
   {hasPermission('contact', 'write') && <EditButton />}
   
   // Backend (Security)
   app.Put("/api/contacts/:id", 
     PermissionMiddleware("contact", "write"),
     handler.UpdateContact)
   ```

3. **Monitor Console Errors**
   ```typescript
   // Check voor permission errors
   if (permissions.length === 0) {
     console.error('No permissions loaded!');
   }
   ```

### DON'T ❌

1. **Vertrouw NIET op Frontend Checks voor Security**
   ```typescript
   // ❌ FOUT - Kan omzeild worden
   if (hasPermission('admin', 'access')) {
     deleteAllUsers(); // Geen backend validatie!
   }
   
   // ✅ GOED - Backend valideert
   await api.delete('/users/all'); // Backend checkt permission
   ```

2. **Wijs Altijd Permissies Toe via Backend**
   ```typescript
   // ✅ GOED - Via Admin UI
   // 1. Login als admin
   // 2. Ga naar Admin - Permissies & Rollen
   // 3. Wijs rollen/permissies toe
   ```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Backend `/api/auth/profile` retourneert permissions array
- [ ] Database migrations uitgevoerd
- [ ] Seed data geladen (roles + permissions)
- [ ] Redis cache geconfigureerd
- [ ] Environment variables ingesteld
- [ ] Console errors gecontroleerd (geen "no permissions" errors)
- [ ] Alle users hebben rollen toegewezen

### Post-Deployment

- [ ] Test login flow
- [ ] Verify permissions worden geladen (check console)
- [ ] Test permission checks in UI
- [ ] Verify backend permission middleware werkt
- [ ] Monitor Redis cache hit rate
- [ ] Check audit logs

## 📚 Gerelateerde Documentatie

- [`FRONTEND_RBAC_GUIDE.md`](FRONTEND_RBAC_GUIDE.md) - Frontend implementatie details
- [`BACKEND_RBAC_IMPLEMENTATION.md`](BACKEND_RBAC_IMPLEMENTATION.md) - Backend implementatie
- [`RBAC_BACKEND_INTEGRATION.md`](RBAC_BACKEND_INTEGRATION.md) - API endpoints

## 🎓 Conclusie

Het DKL Admin Panel RBAC systeem is ontworpen met:

1. **Backend als Enige Bron van Waarheid** - Alle permissies komen uit database
2. **Geen Frontend Fallback** - Dwingt correcte backend implementatie
3. **Defense in Depth** - Checks op UI, Route en API niveau
4. **Performance** - Redis caching voor snelle checks
5. **Flexibiliteit** - Dynamisch beheer via Admin UI

### Waarom Alleen Backend?

**Voordelen:**
- ✅ Dynamisch - wijzigingen direct actief
- ✅ Centraal beheerd via Admin UI
- ✅ Redis caching voor performance
- ✅ Audit trail
- ✅ Single source of truth
- ✅ Geen verwarring over welk systeem actief is
- ✅ Geen sync problemen
- ✅ Dwingt correcte backend implementatie

### Security Belangrijk! 🔒

**Frontend checks = UX (tonen/verbergen UI)**
```typescript
{hasPermission('contact', 'write') && <EditButton />}
```

**Backend checks = Security (echte validatie)**
```go
app.Put("/api/contacts/:id", 
  PermissionMiddleware("contact", "write"),
  handler.UpdateContact)
```

## ✅ Samenvatting

Het systeem is **volledig backend-gedreven** met:
1. Backend als enige bron van permissies
2. Geen frontend fallback
3. Duidelijke console errors bij problemen
4. Volledige documentatie

**Vereist:** Backend MOET altijd permissions retourneren. Check console voor errors!

**Onthoud:** Frontend checks zijn voor UX, Backend checks zijn voor Security! 🔒