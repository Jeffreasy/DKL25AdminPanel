# Aanmeldingen Permission Fix

## Issue
Admin users couldn't access the "Aanmeldingen" (registrations) section in the admin panel.

## Root Cause
The frontend was checking for incorrect permission names:
- Frontend was checking: `aanmelding:read` and `aanmelding:write`
- Backend expects: `registration:read` and `registration:write`

## Backend Permission Structure
According to the backend documentation ([`PERMISSIONS.md`](./backend Docs/api/PERMISSIONS.md)):

### Resource Name
- Resource: `registration` (Event registraties)
- NOT `aanmelding`

### Required Permissions
- **Read access**: `registration:read` permission
- **Write access**: `registration:write` permission

### Admin Role Default Permissions
The admin role has full system access by default, including:
- `registration:read`
- `registration:write`
- `registration:delete`

## Fix Applied
Updated [`src/features/aanmeldingen/components/AanmeldingenTab.tsx`](../src/features/aanmeldingen/components/AanmeldingenTab.tsx):

```typescript
// Before (incorrect)
const canReadAanmeldingen = hasPermission('aanmelding', 'read')
const canWriteAanmeldingen = hasPermission('aanmelding', 'write')

// After (correct)
const canReadAanmeldingen = hasPermission('registration', 'read')
const canWriteAanmeldingen = hasPermission('registration', 'write')
```

## Verification
After this fix, admin users should now:
1. ✅ See the "Aanmeldingen" tab in the dashboard
2. ✅ View all registrations
3. ✅ Update registration statuses
4. ✅ Access all registration details

## Related Documentation
- Backend Events API: [`docs/backend Docs/api/EVENTS.md`](./backend Docs/api/EVENTS.md)
- Backend Permissions: [`docs/backend Docs/api/PERMISSIONS.md`](./backend Docs/api/PERMISSIONS.md)

## Date Fixed
2025-01-08