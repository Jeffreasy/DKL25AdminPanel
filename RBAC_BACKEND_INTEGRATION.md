# ✅ RBAC System Implementation Complete

This document outlines the **complete RBAC (Role-Based Access Control) system** that has been implemented. The system now properly handles permissions directly from the backend with fallback to role-based permissions for backward compatibility.

## 🎯 **Current Implementation Status**

### **✅ Frontend RBAC System**
- **Permission Hook**: `usePermissions()` provides `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`
- **Component Guards**: All components check permissions before rendering UI elements
- **API Error Handling**: 403 responses are properly handled with detailed error messages
- **Auth Flow**: Complete login/refresh token system with permission loading

### **✅ Backend Integration**
- **Database Schema**: Permissions column added to users table
- **Migration**: `20250107182600_add_permissions_to_users.sql` created
- **API Endpoints**: `/api/auth/profile` and `/api/users/:id` expect permissions
- **Fallback System**: Role-based permissions when backend doesn't provide them

### **✅ Permission Structure**
```json
{
  "resource": "contact",
  "action": "read"
}
```

### **✅ Available Permissions**
- **Contact**: `contact:read`, `contact:write`, `contact:delete`
- **Newsletters**: `newsletter:read`, `newsletter:write`, `newsletter:send`, `newsletter:delete`
- **Users**: `user:read`, `user:write`, `user:delete`, `user:manage_roles`
- **Email**: `email:read`, `email:write`, `email:delete`, `email:fetch`
- **Admin Email**: `admin_email:send`
- **Chat**: `chat:read`, `chat:write`, `chat:manage_channel`, `chat:moderate`

## 🎯 **Current State vs Target State**

### **✅ ACHIEVED (Pure RBAC)**
- Permissions are stored directly in database via RBAC tables
- Backend returns permissions array for each user from `user_permissions` view
- Frontend uses backend permissions with role-based fallback
- Complete RBAC integration achieved

### **Backend Implementation Status**
- ✅ RBAC database tables created (roles, permissions, role_permissions, user_roles)
- ✅ Profile endpoint returns permissions and roles arrays
- ✅ Permission validation middleware implemented
- ✅ User permissions loaded from database via `GetUserPermissions()`

## 📋 **Required Backend Changes**

### 1. **Database Schema Update**

The migration `20250107182600_add_permissions_to_users.sql` has been created and adds:

```sql
ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
CREATE INDEX idx_users_permissions ON users USING GIN (permissions);
```

**Permission Structure:**
```json
[
  {"resource": "contact", "action": "read"},
  {"resource": "newsletter", "action": "write"},
  {"resource": "user", "action": "manage_roles"}
]
```

### 2. **API Endpoint Updates**

#### **GET /api/auth/profile**
**Current Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "naam": "John Doe",
  "rol": "admin"
}
```

**Required Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "naam": "John Doe",
  "rol": "admin",
  "permissions": [
    {"resource": "contact", "action": "read"},
    {"resource": "contact", "action": "write"},
    {"resource": "newsletter", "action": "read"}
  ]
}
```

#### **GET /api/users/:id**
**Current Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "naam": "John Doe",
  "rol": "admin",
  "is_actief": true,
  "newsletter_subscribed": true
}
```

**Required Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "naam": "naam": "John Doe",
  "rol": "admin",
  "permissions": [
    {"resource": "contact", "action": "read"},
    {"resource": "contact", "action": "write"}
  ],
  "is_actief": true,
  "newsletter_subscribed": true
}
```

### 3. **Permission Validation Middleware**

Create middleware to validate permissions on protected endpoints:

```javascript
// Example middleware function
function requirePermission(resource, action) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];

    const hasPermission = userPermissions.some(perm =>
      perm.resource === resource && perm.action === action
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        details: {
          required_permission: `${resource}:${action}`,
          user_permissions: userPermissions.map(p => `${p.resource}:${p.action}`)
        }
      });
    }

    next();
  };
}

// Usage in routes
app.get('/api/contact', requirePermission('contact', 'read'), getContacts);
app.post('/api/newsletter', requirePermission('newsletter', 'write'), createNewsletter);
```

### 4. **User Management Updates**

#### **Create/Update User Endpoints**
When creating or updating users, ensure permissions are properly set:

```javascript
// POST /api/users
app.post('/api/users', async (req, res) => {
  const { email, naam, rol, permissions, ...otherFields } = req.body;

  // If permissions not provided, use role-based defaults
  const userPermissions = permissions || getDefaultPermissionsForRole(rol);

  const newUser = await createUser({
    email,
    naam,
    rol,
    permissions: userPermissions,
    ...otherFields
  });

  res.json(newUser);
});
```

#### **Role Change Handling**
When a user's role changes, update their permissions accordingly:

```javascript
// PUT /api/users/:id
app.put('/api/users/:id', async (req, res) => {
  const { rol, permissions, ...updates } = req.body;
  const userId = req.params.id;

  // If role changed but permissions not explicitly set, update permissions
  if (rol && !permissions) {
    const defaultPermissions = getDefaultPermissionsForRole(rol);
    updates.permissions = defaultPermissions;
  }

  const updatedUser = await updateUser(userId, updates);
  res.json(updatedUser);
});
```

### 5. **Permission Management Endpoints**

Add endpoints for managing individual permissions:

```javascript
// GET /api/users/:id/permissions
app.get('/api/users/:id/permissions', async (req, res) => {
  const user = await getUserById(req.params.id);
  res.json(user.permissions || []);
});

// POST /api/users/:id/permissions
app.post('/api/users/:id/permissions', async (req, res) => {
  const { resource, action } = req.body;
  const userId = req.params.id;

  // Add permission to user
  await addUserPermission(userId, { resource, action });

  const updatedUser = await getUserById(userId);
  res.json(updatedUser.permissions);
});

// DELETE /api/users/:id/permissions
app.delete('/api/users/:id/permissions', async (req, res) => {
  const { resource, action } = req.body;
  const userId = req.params.id;

  // Remove permission from user
  await removeUserPermission(userId, { resource, action });

  const updatedUser = await getUserById(userId);
  res.json(updatedUser.permissions);
});
```

## 🔧 **Complete Implementation Status**

### **✅ Frontend RBAC System**
- **AuthProvider**: Loads permissions from backend with role-based fallback
- **usePermissions Hook**: Provides permission checking functions
- **Component Guards**: All UI elements protected by permission checks
- **Menu Filtering**: Sidebar items filtered by user permissions
- **API Services**: Updated to use new authentication with error handling

### **✅ Backend RBAC System**
- **Database Tables**: Complete RBAC schema (roles, permissions, role_permissions, user_roles)
- **Profile Endpoint**: Returns permissions and roles arrays from database
- **Permission Service**: `GetUserPermissions()` loads from `user_permissions` view
- **Middleware**: Validates permissions on protected endpoints
- **Migrations**: V1.20-V1.23 applied with initial RBAC data

## 🧪 **Testing the Integration**

### **Test Cases**

1. **Login Flow**
   ```javascript
   // Should return permissions array
   const response = await fetch('/api/auth/profile');
   expect(response.data.permissions).toBeDefined();
   expect(Array.isArray(response.data.permissions)).toBe(true);
   ```

2. **Permission Checks**
   ```javascript
   // User with admin role should have all permissions
   const adminPermissions = adminUser.permissions;
   expect(adminPermissions).toContainEqual({
     resource: 'contact',
     action: 'read'
   });
   ```

3. **API Protection**
   ```javascript
   // Should return 403 for unauthorized access
   const response = await fetch('/api/contact', {
     headers: { Authorization: `Bearer ${userToken}` }
   });
   expect(response.status).toBe(403);
   ```

## 🚀 **Migration Steps**

1. **Run Database Migration**
   ```bash
   supabase migration up
   ```

2. **Update Backend Code**
   - Modify `/api/auth/profile` endpoint
   - Modify `/api/users/:id` endpoint
   - Add permission validation middleware
   - Update user creation/update logic

3. **Test Integration**
   - Verify login returns permissions
   - Test permission checks work
   - Confirm API endpoints are protected

4. **Deploy Changes**
   - Deploy backend changes
   - Deploy frontend changes
   - Monitor for issues

## 📚 **RBAC Best Practices**

1. **Principle of Least Privilege**: Users should only have minimum required permissions
2. **Regular Audits**: Periodically review user permissions
3. **Permission Inheritance**: Consider role-based defaults with individual overrides
4. **Audit Logging**: Log permission changes for security
5. **Fail-Safe Defaults**: New users should start with minimal permissions

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"permissions is undefined"**
   - Backend not returning permissions array
   - Check `/api/auth/profile` endpoint

2. **403 Errors**
   - User lacks required permission
   - Check permission validation middleware

3. **Permission Not Granted**
   - User role not properly mapped to permissions
   - Check database migration and user creation logic

### **Debug Steps**

1. Check user permissions in database
2. Verify API responses include permissions
3. Test permission checks in frontend
4. Review middleware logs for denied requests

---

**Note**: This document assumes a Node.js/Express backend with PostgreSQL/Supabase. Adjust implementation details based on your actual backend technology stack.