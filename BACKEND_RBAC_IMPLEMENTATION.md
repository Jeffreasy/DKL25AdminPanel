# 🔐 RBAC Backend Implementation Guide

Deze gids legt uit hoe je de backend API endpoints moet implementeren voor de Admin interface die zojuist is toegevoegd aan de frontend.

## 📋 **Vereiste Database Tabellen**

Je hebt waarschijnlijk al een `permissions` tabel met deze structuur:

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    is_system_permission BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);
```

## 🚀 **API Endpoints Implementeren**

### **1. GET /api/permissions**
**Doel:** Haal alle permissies op

```javascript
app.get('/api/permissions', authenticateToken, async (req, res) => {
  try {
    const permissions = await db.query(`
      SELECT id, resource, action, description, is_system_permission, created_at, updated_at
      FROM permissions
      ORDER BY resource, action
    `);

    res.json(permissions.rows);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});
```

### **2. POST /api/permissions**
**Doel:** Nieuwe permissie aanmaken

```javascript
app.post('/api/permissions', authenticateToken, requirePermission('system', 'admin'), async (req, res) => {
  try {
    const { resource, action, description, is_system_permission } = req.body;

    const result = await db.query(`
      INSERT INTO permissions (resource, action, description, is_system_permission)
      VALUES ($1, $2, $3, $4)
      RETURNING id, resource, action, description, is_system_permission, created_at, updated_at
    `, [resource, action, description, is_system_permission || false]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
});
```

### **3. GET /api/roles**
**Doel:** Haal alle rollen op met hun permissies

```javascript
app.get('/api/roles', authenticateToken, async (req, res) => {
  try {
    const roles = await db.query(`
      SELECT
        r.id,
        r.name,
        r.description,
        r.created_at,
        r.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'resource', p.resource,
              'action', p.action,
              'description', p.description,
              'is_system_permission', p.is_system_permission,
              'created_at', p.created_at,
              'updated_at', p.updated_at
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name, r.description, r.created_at, r.updated_at
      ORDER BY r.name
    `);

    res.json(roles.rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});
```

### **4. POST /api/roles**
**Doel:** Nieuwe rol aanmaken

```javascript
app.post('/api/roles', authenticateToken, requirePermission('system', 'admin'), async (req, res) => {
  try {
    const { name, description, permission_ids } = req.body;

    // Start transaction
    await db.query('BEGIN');

    // Create role
    const roleResult = await db.query(`
      INSERT INTO roles (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description, created_at, updated_at
    `, [name, description]);

    const role = roleResult.rows[0];

    // Assign permissions if provided
    if (permission_ids && permission_ids.length > 0) {
      const values = permission_ids.map((_, index) => `($1, $${index + 2})`).join(', ');
      const params = [role.id, ...permission_ids];

      await db.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ${values}
      `, params);
    }

    await db.query('COMMIT');

    // Fetch complete role with permissions
    const completeRole = await db.query(`
      SELECT
        r.id,
        r.name,
        r.description,
        r.created_at,
        r.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'resource', p.resource,
              'action', p.action,
              'description', p.description,
              'is_system_permission', p.is_system_permission,
              'created_at', p.created_at,
              'updated_at', p.updated_at
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id, r.name, r.description, r.created_at, r.updated_at
    `, [role.id]);

    res.status(201).json(completeRole.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});
```

### **5. PUT /api/roles/:id/permissions**
**Doel:** Permissies toewijzen aan een rol

```javascript
app.put('/api/roles/:id/permissions', authenticateToken, requirePermission('system', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_ids } = req.body;

    // Start transaction
    await db.query('BEGIN');

    // Remove existing permissions
    await db.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

    // Add new permissions
    if (permission_ids && permission_ids.length > 0) {
      const values = permission_ids.map((_, index) => `($1, $${index + 2})`).join(', ');
      const params = [id, ...permission_ids];

      await db.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ${values}
      `, params);
    }

    await db.query('COMMIT');

    // Return updated role with permissions
    const updatedRole = await db.query(`
      SELECT
        r.id,
        r.name,
        r.description,
        r.created_at,
        r.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'resource', p.resource,
              'action', p.action,
              'description', p.description,
              'is_system_permission', p.is_system_permission,
              'created_at', p.created_at,
              'updated_at', p.updated_at
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id, r.name, r.description, r.created_at, r.updated_at
    `, [id]);

    res.json(updatedRole.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating role permissions:', error);
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
});
```

### **6. PUT /api/users/:id/roles**
**Doel:** Rollen toewijzen aan een gebruiker

```javascript
app.put('/api/users/:id/roles', authenticateToken, requirePermission('user', 'manage_roles'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role_ids } = req.body;

    // Start transaction
    await db.query('BEGIN');

    // Remove existing roles
    await db.query('DELETE FROM user_roles WHERE user_id = $1', [id]);

    // Add new roles
    if (role_ids && role_ids.length > 0) {
      const values = role_ids.map((_, index) => `($1, $${index + 2})`).join(', ');
      const params = [id, ...role_ids];

      await db.query(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES ${values}
      `, params);
    }

    await db.query('COMMIT');

    res.json({ success: true });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
});
```

## 🔐 **Middleware Functies**

### **Permission Middleware**

```javascript
function requirePermission(resource, action) {
  return async (req, res, next) => {
    try {
      // Get user permissions from database
      const userPermissions = await getUserPermissions(req.user.id);

      const hasPermission = userPermissions.some(perm =>
        perm.resource === resource && perm.action === action
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Permission denied',
          code: 'PERMISSION_DENIED',
          required_permission: `${resource}:${action}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

async function getUserPermissions(userId) {
  const result = await db.query(`
    SELECT DISTINCT p.resource, p.action
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN user_roles ur ON rp.role_id = ur.role_id
    WHERE ur.user_id = $1
  `, [userId]);

  return result.rows;
}
```

## 📊 **Data Populatie**

### **Permissies Invoegen**

```sql
-- Voeg je bestaande permissies in als ze nog niet bestaan
INSERT INTO permissions (id, resource, action, description, is_system_permission) VALUES
('138b5f63-5ed3-4679-8d47-a26d5db26e9f', 'contact', 'read', 'Contactformulieren bekijken', true),
('13a0ce40-f06a-4006-8e47-e848a843a175', 'photo', 'delete', 'Foto''s verwijderen', true),
-- ... voeg alle andere permissies toe
ON CONFLICT (id) DO NOTHING;
```

### **Basis Rollen Aanmaken**

```sql
-- Maak basis rollen aan
INSERT INTO roles (name, description) VALUES
('admin', 'Volledige admin toegang'),
('staff', 'Staff toegang tot beheerfuncties'),
('user', 'Basis gebruiker toegang')
ON CONFLICT (name) DO NOTHING;
```

## 🧪 **Testen**

1. **Start je backend server**
2. **Ga naar `/admin` in de frontend**
3. **Controleer of permissies en rollen worden geladen**
4. **Test het aanmaken van nieuwe permissies/rollen**
5. **Test permission-toekenning aan rollen**

## 🔍 **Debugging**

Als de tabellen leeg blijven:

1. **Controleer database connectie**
2. **Controleer of tabellen bestaan**
3. **Controleer of data is ingevoegd**
4. **Controleer server logs voor errors**
5. **Controleer network requests in browser dev tools**

De frontend is nu klaar en wacht op de backend implementatie!