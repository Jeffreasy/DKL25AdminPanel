# 👥 Staff Role Permissions Guide

**Datum**: 2025-11-02  
**Status**: Configuration Guide  
**Role**: staff  

---

## 🎯 Probleem: Staff ziet niet alle navigatie

Staff users zien mogelijk niet alle menu items ondanks dat de role bedoeld is voor "read-only access".

### Root Cause

De `staff` role heeft alleen `staff:access` permission, maar dit geeft **NIET automatisch** alle read permissions. Elke navigatie item heeft specifieke permissions nodig.

---

## 📋 Navigatie Permissions Vereist

### Huidige Navigation Structure

Volgens [`navigation.ts`](../../src/types/navigation.ts):

| Menu Item | Path | Permission Vereist | Staff Heeft? |
|-----------|------|-------------------|--------------|
| Dashboard | `/dashboard` | - (geen) | ✅ JA |
| Media | `/media` | `photo:read` | ❓ Check |
| Video's | `/videos` | `video:read` | ❓ Check |
| **Relaties** (group) | - | - | - |
| ↳ Partners | `/partners` | `partner:read` | ❓ Check |
| ↳ Sponsors | `/sponsors` | `sponsor:read` | ❓ Check |
| Nieuwsbrieven | `/newsletters` | `newsletter:read` | ❓ Check |
| Gebruikers | `/users` | `user:read` | ❓ Check |
| Admin | `/admin` | `admin:access` | ❌ NEE |
| Frontend | `/frontend` | - (geen) | ✅ JA |

### Aanbevolen Staff Permissions (Read-Only Access)

Voor **volledige read-only navigatie** zou staff moeten hebben:

```sql
-- Core Access
- staff:access                    ✅ (Identifier)

-- Media Management  
- photo:read                       ⚠️ Nodig voor /media
- album:read                       ⚠️ Nodig in Media page
- video:read                       ⚠️ Nodig voor /videos

-- Relations
- partner:read                     ⚠️ Nodig voor /partners
- sponsor:read                     ⚠️ Nodig voor /sponsors

-- Communication
- newsletter:read                  ⚠️ Nodig voor /newsletters
- contact:read                     ⚠️ Nodig voor contacts (if exists)

-- User Management
- user:read                        ⚠️ Nodig voor /users

-- Optional (depends on use case)
- radio_recording:read
- program_schedule:read
- social_embed:read
- social_link:read
- under_construction:read
```

---

## 🔧 Oplossing Opties

### Optie 1: Update Staff Role Permissions (RECOMMENDED)

**In Admin Panel**:
1. Login als admin
2. Ga naar Admin → Permissies & Rollen
3. Tab "Rollen"
4. Zoek "staff" role
5. Klik "Bewerken"
6. Selecteer alle read permissions:
   - `photo:read`
   - `album:read`
   - `video:read`
   - `partner:read`
   - `sponsor:read`
   - `newsletter:read`
   - `user:read`
   - `contact:read`
7. Klik "Opslaan"
8. Klik "Cache Vernieuwen"
9. Staff users moeten re-loggen

**Via SQL** (Direct database):
```sql
-- Get staff role ID
SELECT id FROM roles WHERE name = 'staff';
-- Let's say it's 'staff-role-uuid'

-- Get permission IDs
SELECT id, resource, action FROM permissions WHERE action = 'read';

-- Assign all read permissions to staff role
INSERT INTO role_permissions (role_id, permission_id)
VALUES 
  ('staff-role-uuid', (SELECT id FROM permissions WHERE resource = 'photo' AND action = 'read')),
  ('staff-role-uuid', (SELECT id FROM permissions WHERE resource = 'album' AND action = 'read')),
  ('staff-role-uuid', (SELECT id FROM permissions WHERE resource = 'video' AND action = 'read')),
  ('staff-role-uuid', (SELECT id FROM permissions WHERE resource = 'partner' AND action = 'read')),
  ('staff-role-uuid', (SELECT id FROM permissions WHERE resource = 'sponsor' AND action = 'read')),
  ('staff-role-uuid', (SELECT id FROM permissions WHERE resource = 'newsletter' AND action = 'read')),
  ('staff-role-uuid', (SELECT id FROM permissions WHERE resource = 'user' AND action = 'read')),
  ('staff-role-uuid', (SELECT id FROM permissions WHERE resource = 'contact' AND action = 'read'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Refresh permission cache
-- Run: POST /api/rbac/cache/refresh (via admin panel of curl)
```

### Optie 2: Update Navigation Permissions

Als staff GEEN toegang tot bepaalde secties mag hebben, update de navigation items om `staff:access` te accepteren:

```typescript
// navigation.ts - Alleen voor items die staff MAG zien
{
  label: 'Media',
  path: '/media',
  icon: FilmIcon,
  permission: 'photo:read',  // OF: check for staff:access als fallback
}
```

Dit vereist logica wijziging in [`SidebarContent.tsx`](../../src/components/layout/Sidebar/SidebarContent.tsx:22-24).

### Optie 3: Specifieke Staff Navigation

Aparte navigation items voor staff met alleen `staff:access` permission:

```typescript
export const menuItems: MenuItemOrGroup[] = [
  { label: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { 
    label: 'Media Beheer',
    items: [
      { label: 'Foto\'s', path: '/photos', icon: FilmIcon, permission: 'photo:read' },
      { label: 'Albums', path: '/albums', icon: FilmIcon, permission: 'album:read' },
      { label: 'Video\'s', path: '/videos', icon: VideoCameraIcon, permission: 'video:read' },
    ]
  },
  // etc.
]
```

---

## 🎯 Aanbeveling

**Optie 1** is de beste oplossing omdat:
- ✅ Staff role krijgt logische read-only permissions
- ✅ Navigation werkt out-of-the-box
- ✅ Consistent met "staff = read-only support" concept
- ✅ Geen code wijzigingen nodig
- ✅ Easy te beheren via admin panel

**Minimale Staff Permissions** (voor volledige navigatie):
```
staff:access         (identifier)
photo:read           (Media navigatie)
album:read           (Media functionaliteit)
video:read           (Video's navigatie)
partner:read         (Partners navigatie)
sponsor:read         (Sponsors navigatie)
newsletter:read      (Nieuwsbrieven navigatie)
user:read            (Gebruikers navigatie)
contact:read         (Contact messages, indien beschikbaar)
```

**Optioneel** (afhankelijk van use case):
```
radio_recording:read
program_schedule:read
social_embed:read
social_link:read
under_construction:read
aanmelding:read
```

---

## 🐛 Bug Fix Record

### Fixed Issue: Incorrect Admin Permission

**File**: [`src/types/navigation.ts:55`](../../src/types/navigation.ts:55)

**Before**:
```typescript
{ label: 'Admin', path: '/admin', icon: ShieldCheckIcon, permission: 'system:admin' }
```

**After**:
```typescript
{ label: 'Admin', path: '/admin', icon: ShieldCheckIcon, permission: 'admin:access' }
```

**Impact**:
- ✅ Admin navigatie item gebruikt nu correcte permission
- ✅ Consistent met backend RBAC systeem
- ✅ `admin:access` is een bestaande, gedocumenteerde permission

---

## ✅ Verificatie Stappen

Na permission update voor staff role:

1. **In Database**:
```sql
-- Check staff permissions
SELECT 
  r.name AS role,
  p.resource,
  p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'staff'
ORDER BY p.resource, p.action;
```

2. **In Admin Panel**:
- Login als admin
- Ga naar Admin → Permissies & Rollen
- Tab "Rollen"
- Klik "staff" role → Bewerken
- Verify alle read permissions geselecteerd zijn

3. **Test als Staff User**:
- Logout admin
- Login als staff user
- Verify alle menu items zichtbaar (behalve Admin)
- Verify read-only access (geen edit/delete knoppen)
- Verify permission denied bij write/delete acties

4. **Cache Refresh**:
- Klik "Cache Vernieuwen" in admin panel
- OF wait 5 minuten voor auto-expiry
- OR staff user moet re-loggen

---

**Versie**: 1.0  
**Datum**: 2025-11-02  
**Status**: Fix Documented - Awaiting Permission Configuration