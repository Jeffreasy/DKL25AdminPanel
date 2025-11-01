# 🚀 Frontend Backend API Reference - Complete

**Status**: ✅ Backend Fully Implemented  
**Version**: 1.48.0  
**Date**: 2025-11-01

---

## 📋 Overview

Complete API reference voor de DKL25 Admin Panel frontend. Alle endpoints zijn **volledig geïmplementeerd** in het backend met RBAC permission checks.

**Base URLs**:
- Development: `http://localhost:8080/api`
- Production: `https://dklemailservice.onrender.com/api`

---

## 🔐 Authentication

Alle admin endpoints vereisen JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dekoninklijkeloop.nl",
  "wachtwoord": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "refresh_token": "base64-string",
  "user": {
    "id": "uuid",
    "email": "admin@dekoninklijkeloop.nl",
    "naam": "Admin User",
    "rol": "admin",
    "permissions": [
      {"resource": "contact", "action": "read"},
      {"resource": "contact", "action": "write"},
      {"resource": "photo", "action": "read"}
    ],
    "roles": [
      {"id": "uuid", "name": "admin", "description": "Administrator"}
    ],
    "is_actief": true
  }
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:** Same structure as login user object

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "token": "new-access-token",
  "refresh_token": "new-refresh-token"
}
```

**Backend Reference:** [`handlers/auth_handler.go`](../handlers/auth_handler.go)

---

## 📧 Contact API

**Permissions**: `contact:read`, `contact:write`, `contact:delete`  
**Handler**: [`handlers/contact_handler.go`](../handlers/contact_handler.go)

### List All Contacts
```http
GET /api/contact?limit=10&offset=0
Authorization: Bearer <token>
```

**Permission Required:** `contact:read`

**Response:**
```json
[
  {
    "id": "uuid",
    "naam": "Jan Jansen",
    "email": "jan@example.com",
    "onderwerp": "Vraag over evenement",
    "bericht": "Ik heb een vraag over...",
    "status": "nieuw",
    "email_verzonden": false,
    "email_verzonden_op": null,
    "privacy_akkoord": true,
    "notities": "",
    "behandeld_door": null,
    "behandeld_op": null,
    "beantwoord": false,
    "antwoord_tekst": "",
    "antwoord_datum": null,
    "antwoord_door": "",
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

### Get Contact by ID
```http
GET /api/contact/:id
Authorization: Bearer <token>
```

**Permission Required:** `contact:read`

**Response:** Single contact object with antwoorden array

### Get Contacts by Status
```http
GET /api/contact/status/:status
Authorization: Bearer <token>
```

**Permission Required:** `contact:read`

**Valid statuses:** `nieuw`, `in_behandeling`, `beantwoord`, `gesloten`

### Update Contact
```http
PUT /api/contact/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_behandeling",
  "notities": "Bezig met afhandelen"
}
```

**Permission Required:** `contact:write`

**Response:** Updated contact object

### Delete Contact
```http
DELETE /api/contact/:id
Authorization: Bearer <token>
```

**Permission Required:** `contact:delete`

**Response:**
```json
{
  "success": true,
  "message": "Contactformulier succesvol verwijderd"
}
```

### Add Reply to Contact
```http
POST /api/contact/:id/antwoord
Authorization: Bearer <token>
Content-Type: application/json

{
  "tekst": "Bedankt voor uw bericht..."
}
```

**Permission Required:** `contact:write`

**Response:** Created antwoord object

**Note:** Automatically updates contact status to "beantwoord" and sends email reply

---

## 📸 Photos API

**Permissions**: `photo:read`, `photo:write`, `photo:delete`  
**Handler**: [`handlers/photo_handler.go`](../handlers/photo_handler.go)

### List Visible Photos (Public)
```http
GET /api/photos?year=2024&title=search&cloudinary_folder=folder
```

**No auth required** - Public endpoint

**Query Parameters:**
- `year` (int) - Filter by year
- `title` (string) - Filter by title (partial match)
- `description` (string) - Filter by description (partial match)
- `cloudinary_folder` (string) - Filter by Cloudinary folder

**Response:**
```json
[
  {
    "id": "uuid",
    "cloudinary_public_id": "samples/photo123",
    "url": "https://res.cloudinary.com/.../photo.jpg",
    "thumbnail_url": "https://res.cloudinary.com/.../photo_thumb.jpg",
    "alt_text": "Photo description",
    "title": "Photo Title",
    "description": "Photo description",
    "year": 2024,
    "cloudinary_folder": "event_2024",
    "visible": true,
    "order_number": 0,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

### List All Photos (Admin)
```http
GET /api/photos/admin?limit=10&offset=0
Authorization: Bearer <token>
```

**Permission Required:** `photo:read`

### Get Photo by ID
```http
GET /api/photos/:id
Authorization: Bearer <token>
```

**Permission Required:** `photo:read`

### Create Photo
```http
POST /api/photos
Authorization: Bearer <token>
Content-Type: application/json

{
  "cloudinary_public_id": "samples/photo123",
  "url": "https://res.cloudinary.com/.../photo.jpg",
  "thumbnail_url": "https://res.cloudinary.com/.../photo_thumb.jpg",
  "alt_text": "Photo alt text",
  "title": "Photo Title",
  "description": "Description",
  "year": 2024,
  "cloudinary_folder": "event_2024",
  "visible": true,
  "order_number": 0
}
```

**Permission Required:** `photo:write`

**Response:** Created photo object (201)

### Update Photo
```http
PUT /api/photos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "visible": false,
  "year": 2025
}
```

**Permission Required:** `photo:write`

### Delete Photo
```http
DELETE /api/photos/:id
Authorization: Bearer <token>
```

**Permission Required:** `photo:delete`

---

## 📚 Albums API

**Permissions**: `album:read`, `album:write`, `album:delete`  
**Handler**: [`handlers/album_handler.go`](../handlers/album_handler.go)

### List Visible Albums (Public)
```http
GET /api/albums?include_covers=true
```

**No auth required** - Public endpoint

**Query Parameters:**
- `include_covers` (bool) - Include cover photo information

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Zomer 2024",
    "description": "Foto's van het zomerevent",
    "cover_photo_id": "photo_uuid",
    "visible": true,
    "order_number": 0,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

### Get Album Photos (Public)
```http
GET /api/albums/:id/photos
```

**No auth required** - Public endpoint

**Response:**
```json
[
  {
    "album_id": "album_uuid",
    "photo_id": "photo_uuid",
    "order_number": 0,
    "created_at": "2025-11-01T10:00:00Z",
    "photo": {
      "id": "photo_uuid",
      "url": "https://...",
      "title": "Photo Title"
    }
  }
]
```

### List All Albums (Admin)
```http
GET /api/albums/admin?limit=10&offset=0
Authorization: Bearer <token>
```

**Permission Required:** `album:read`

### Get Album by ID
```http
GET /api/albums/:id
Authorization: Bearer <token>
```

**Permission Required:** `album:read`

### Create Album
```http
POST /api/albums
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Album",
  "description": "Album description",
  "cover_photo_id": "photo_uuid",
  "visible": true,
  "order_number": 0
}
```

**Permission Required:** `album:write`

**Response:** Created album (201)

### Update Album
```http
PUT /api/albums/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "cover_photo_id": "new_photo_uuid",
  "visible": false
}
```

**Permission Required:** `album:write`

### Delete Album
```http
DELETE /api/albums/:id
Authorization: Bearer <token>
```

**Permission Required:** `album:delete`

### Add Photo to Album
```http
POST /api/albums/:id/photos
Authorization: Bearer <token>
Content-Type: application/json

{
  "photo_id": "photo_uuid",
  "order_number": 0
}
```

**Permission Required:** `album:write`

**Response:** Created album_photo relationship (201)

### Remove Photo from Album
```http
DELETE /api/albums/:id/photos/:photoId
Authorization: Bearer <token>
```

**Permission Required:** `album:delete`

### Reorder Albums
```http
PUT /api/albums/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "album_order": [
    {"id": "uuid1", "order_number": 0},
    {"id": "uuid2", "order_number": 1}
  ]
}
```

**Permission Required:** `album:write`

### Reorder Album Photos
```http
PUT /api/albums/:id/photos/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "photo_order": [
    {"photo_id": "uuid1", "order_number": 0},
    {"photo_id": "uuid2", "order_number": 1}
  ]
}
```

**Permission Required:** `album:write`

---

## 🎥 Videos API

**Permissions**: `video:read`, `video:write`, `video:delete`  
**Handler**: [`handlers/video_handler.go`](../handlers/video_handler.go)

### List Visible Videos (Public)
```http
GET /api/videos
```

**No auth required** - Public endpoint

**Response:**
```json
[
  {
    "id": "uuid",
    "video_id": "youtube_id",
    "url": "https://youtube.com/watch?v=...",
    "title": "Highlights 2024",
    "description": "Beste momenten",
    "thumbnail_url": "https://...",
    "visible": true,
    "order_number": 0,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

### List All Videos (Admin)
```http
GET /api/videos/admin?limit=10&offset=0
Authorization: Bearer <token>
```

**Permission Required:** `video:read`

### Get Video by ID
```http
GET /api/videos/:id
Authorization: Bearer <token>
```

**Permission Required:** `video:read`

### Create Video
```http
POST /api/videos
Authorization: Bearer <token>
Content-Type: application/json

{
  "video_id": "youtube_id",
  "url": "https://youtube.com/watch?v=...",
  "title": "Video Title",
  "description": "Optional description",
  "thumbnail_url": "https://...",
  "visible": true,
  "order_number": 0
}
```

**Permission Required:** `video:write`

**Response:** Created video (201)

### Update Video
```http
PUT /api/videos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "url": "https://vimeo.com/...",
  "visible": false
}
```

**Permission Required:** `video:write`

### Delete Video
```http
DELETE /api/videos/:id
Authorization: Bearer <token>
```

**Permission Required:** `video:delete`

---

## 🤝 Partners API

**Permissions**: `partner:read`, `partner:write`, `partner:delete`  
**Handler**: [`handlers/partner_handler.go`](../handlers/partner_handler.go)

### List Visible Partners (Public)
```http
GET /api/partners
```

**No auth required** - Public endpoint

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Partner BV",
    "description": "Premium partner sinds 2020",
    "logo": "https://cloudinary.../logo.png",
    "website": "https://partner.nl",
    "tier": "gold",
    "since": "2020-01-15T00:00:00Z",
    "visible": true,
    "order_number": 0,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

### List All Partners (Admin)
```http
GET /api/partners/admin?limit=10&offset=0
Authorization: Bearer <token>
```

**Permission Required:** `partner:read`

### Get Partner by ID
```http
GET /api/partners/:id
Authorization: Bearer <token>
```

**Permission Required:** `partner:read`

### Create Partner
```http
POST /api/partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Partner Name",
  "description": "Optional description",
  "logo": "https://cloudinary.../logo.png",
  "website": "https://partner.nl",
  "tier": "bronze",
  "since": "2024-01-01T00:00:00Z",
  "visible": true,
  "order_number": 0
}
```

**Permission Required:** `partner:write`

**Valid tiers:** `bronze`, `silver`, `gold`

**Response:** Created partner (201)

### Update Partner
```http
PUT /api/partners/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "tier": "gold",
  "visible": false
}
```

**Permission Required:** `partner:write`

### Delete Partner
```http
DELETE /api/partners/:id
Authorization: Bearer <token>
```

**Permission Required:** `partner:delete`

---

## 🎁 Sponsors API

**Permissions**: `sponsor:read`, `sponsor:write`, `sponsor:delete`
**Handler**: [`handlers/sponsor_handler.go`](../handlers/sponsor_handler.go)

### List Visible Sponsors (Public)
```http
GET /api/sponsors
```

**No auth required** - Public endpoint

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Sponsor Naam",
    "description": "Sponsor beschrijving",
    "logo_url": "https://cloudinary.../logo.png",
    "website_url": "https://sponsor.nl",
    "order_number": 0,
    "is_active": true,
    "visible": true,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

### List All Sponsors (Admin)
```http
GET /api/sponsors/admin?limit=10&offset=0
Authorization: Bearer <token>
```

**Permission Required:** `sponsor:read`

### Get Sponsor by ID
```http
GET /api/sponsors/:id
Authorization: Bearer <token>
```

**Permission Required:** `sponsor:read`

### Create Sponsor
```http
POST /api/sponsors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sponsor Name",
  "description": "Optional description",
  "logo_url": "https://cloudinary.../logo.png",
  "website_url": "https://sponsor.nl",
  "order_number": 0,
  "is_active": true,
  "visible": true
}
```

**Permission Required:** `sponsor:write`

**Response:** Created sponsor (201)

### Update Sponsor
```http
PUT /api/sponsors/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "visible": false
}
```

**Permission Required:** `sponsor:write`

### Delete Sponsor
```http
DELETE /api/sponsors/:id
Authorization: Bearer <token>
```

**Permission Required:** `sponsor:delete`

---

## 👥 User Management & RBAC API

**Permissions**: `user:read`, `user:write`, `user:delete`, `user:manage_roles`
**Handler**: [`handlers/rbac_handler.go`](../handlers/rbac_handler.go)

### Roles Management

#### List All Roles
```http
GET /api/rbac/roles
Authorization: Bearer <token>
```

**Permission Required:** `user:read`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "admin",
    "description": "Administrator role",
    "is_system_role": true,
    "permissions": [
      {
        "id": "uuid",
        "resource": "contact",
        "action": "read",
        "description": "Read contact messages"
      }
    ],
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

#### Create Role
```http
POST /api/rbac/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "editor",
  "description": "Content editor role"
}
```

**Permission Required:** `user:write`

**Response:** Created role (201)

#### Update Role
```http
PUT /api/rbac/roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "updated_name",
  "description": "Updated description"
}
```

**Permission Required:** `user:write`

#### Delete Role
```http
DELETE /api/rbac/roles/:id
Authorization: Bearer <token>
```

**Permission Required:** `user:delete`

**Note:** Cannot delete system roles

### Permissions Management

#### List All Permissions
```http
GET /api/rbac/permissions?group_by_resource=true
Authorization: Bearer <token>
```

**Permission Required:** `user:read`

**Query Parameters:**
- `group_by_resource` (bool) - Group permissions by resource

**Response (grouped):**
```json
{
  "groups": [
    {
      "resource": "contact",
      "permissions": [
        {
          "id": "uuid",
          "resource": "contact",
          "action": "read",
          "description": "Read contact messages",
          "is_system_permission": true,
          "created_at": "2025-11-01T10:00:00Z",
          "updated_at": "2025-11-01T10:00:00Z"
        }
      ],
      "count": 3
    }
  ],
  "total": 50
}
```

#### Create Permission
```http
POST /api/rbac/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "resource": "report",
  "action": "read",
  "description": "Read reports",
  "is_system_permission": false
}
```

**Permission Required:** `user:write`

**Response:** Created permission (201)

#### Delete Permission
```http
DELETE /api/rbac/permissions/:id
Authorization: Bearer <token>
```

**Permission Required:** `user:delete`

**Note:** Cannot delete system permissions

### Role-Permission Assignments

#### Assign Permission to Role
```http
POST /api/rbac/roles/:roleId/permissions/:permissionId
Authorization: Bearer <token>
```

**Permission Required:** `user:manage_roles`

**Response:** Success message (200)

#### Remove Permission from Role
```http
DELETE /api/rbac/roles/:roleId/permissions/:permissionId
Authorization: Bearer <token>
```

**Permission Required:** `user:manage_roles`

### User-Role Assignments

#### Get User Roles
```http
GET /api/users/:userId/roles
Authorization: Bearer <token>
```

**Permission Required:** `user:read`

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "user_uuid",
    "role_id": "role_uuid",
    "assigned_at": "2025-11-01T10:00:00Z",
    "is_active": true,
    "expires_at": null,
    "role": {
      "id": "role_uuid",
      "name": "admin",
      "description": "Administrator"
    }
  }
]
```

#### Assign Role to User
```http
POST /api/users/:userId/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "role_id": "role_uuid",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Permission Required:** `user:manage_roles`

**Response:** Created user role assignment (201)

#### Remove Role from User
```http
DELETE /api/users/:userId/roles/:roleId
Authorization: Bearer <token>
```

**Permission Required:** `user:manage_roles`

#### Get User Permissions
```http
GET /api/users/:userId/permissions
Authorization: Bearer <token>
```

**Permission Required:** `user:read`

**Response:**
```json
[
  {
    "user_id": "user_uuid",
    "email": "user@example.com",
    "role_name": "admin",
    "resource": "contact",
    "action": "read",
    "permission_assigned_at": "2025-11-01T10:00:00Z",
    "role_assigned_at": "2025-11-01T10:00:00Z"
  }
]
```

### Cache Management

#### Refresh Permission Cache
```http
POST /api/rbac/cache/refresh
Authorization: Bearer <token>
```

**Permission Required:** `user:manage_roles`

**Response:**
```json
{
  "message": "Permission cache refreshed successfully"
}
```

**Note:** Use this after bulk permission/role changes to update caches

---

## 🎯 ALL Available Endpoints Summary

### Authentication & Auth
| Endpoint | Method | Auth | Permission | Handler |
|----------|--------|------|------------|---------|
| `/api/auth/login` | POST | ❌ | - | AuthHandler |
| `/api/auth/logout` | POST | ❌ | - | AuthHandler |
| `/api/auth/refresh` | POST | ❌ | - | AuthHandler |
| `/api/auth/profile` | GET | ✅ | - | AuthHandler |
| `/api/auth/reset-password` | POST | ✅ | - | AuthHandler |

### Contact Management
| Endpoint | Method | Auth | Permission | Handler |
|----------|--------|------|------------|---------|
| `/api/contact` | GET | ✅ | `contact:read` | ContactHandler |
| `/api/contact/:id` | GET | ✅ | `contact:read` | ContactHandler |
| `/api/contact/status/:status` | GET | ✅ | `contact:read` | ContactHandler |
| `/api/contact/:id` | PUT | ✅ | `contact:write` | ContactHandler |
| `/api/contact/:id/antwoord` | POST | ✅ | `contact:write` | ContactHandler |
| `/api/contact/:id` | DELETE | ✅ | `contact:delete` | ContactHandler |

### Photos
| Endpoint | Method | Auth | Permission | Handler |
|----------|--------|------|------------|---------|
| `/api/photos` | GET | ❌ | - | PhotoHandler (Public) |
| `/api/photos/admin` | GET | ✅ | `photo:read` | PhotoHandler |
| `/api/photos/:id` | GET | ✅ | `photo:read` | PhotoHandler |
| `/api/photos` | POST | ✅ | `photo:write` | PhotoHandler |
| `/api/photos/:id` | PUT | ✅ | `photo:write` | PhotoHandler |
| `/api/photos/:id` | DELETE | ✅ | `photo:delete` | PhotoHandler |

### Albums
| Endpoint | Method | Auth | Permission | Handler |
|----------|--------|------|------------|---------|
| `/api/albums` | GET | ❌ | - | AlbumHandler (Public) |
| `/api/albums/:id/photos` | GET | ❌ | - | AlbumHandler (Public) |
| `/api/albums/admin` | GET | ✅ | `album:read` | AlbumHandler |
| `/api/albums/:id` | GET | ✅ | `album:read` | AlbumHandler |
| `/api/albums` | POST | ✅ | `album:write` | AlbumHandler |
| `/api/albums/:id` | PUT | ✅ | `album:write` | AlbumHandler |
| `/api/albums/reorder` | PUT | ✅ | `album:write` | AlbumHandler |
| `/api/albums/:id/photos` | POST | ✅ | `album:write` | AlbumHandler |
| `/api/albums/:id/photos/reorder` | PUT | ✅ | `album:write` | AlbumHandler |
| `/api/albums/:id` | DELETE | ✅ | `album:delete` | AlbumHandler |
| `/api/albums/:id/photos/:photoId` | DELETE | ✅ | `album:delete` | AlbumHandler |

### Videos
| Endpoint | Method | Auth | Permission | Handler |
|----------|--------|------|------------|---------|
| `/api/videos` | GET | ❌ | - | VideoHandler (Public) |
| `/api/videos/admin` | GET | ✅ | `video:read` | VideoHandler |
| `/api/videos/:id` | GET | ✅ | `video:read` | VideoHandler |
| `/api/videos` | POST | ✅ | `video:write` | VideoHandler |
| `/api/videos/:id` | PUT | ✅ | `video:write` | VideoHandler |
| `/api/videos/:id` | DELETE | ✅ | `video:delete` | VideoHandler |

### Partners
| Endpoint | Method | Auth | Permission | Handler |
|----------|--------|------|------------|---------|
| `/api/partners` | GET | ❌ | - | PartnerHandler (Public) |
| `/api/partners/admin` | GET | ✅ | `partner:read` | PartnerHandler |
| `/api/partners/:id` | GET | ✅ | `partner:read` | PartnerHandler |
| `/api/partners` | POST | ✅ | `partner:write` | PartnerHandler |
| `/api/partners/:id` | PUT | ✅ | `partner:write` | PartnerHandler |
| `/api/partners/:id` | DELETE | ✅ | `partner:delete` | PartnerHandler |

### Sponsors
| Endpoint | Method | Auth | Permission | Handler |
|----------|--------|------|------------|---------|
| `/api/sponsors` | GET | ❌ | - | SponsorHandler (Public) |
| `/api/sponsors/admin` | GET | ✅ | `sponsor:read` | SponsorHandler |
| `/api/sponsors/:id` | GET | ✅ | `sponsor:read` | SponsorHandler |
| `/api/sponsors` | POST | ✅ | `sponsor:write` | SponsorHandler |
| `/api/sponsors/:id` | PUT | ✅ | `sponsor:write` | SponsorHandler |
| `/api/sponsors/:id` | DELETE | ✅ | `sponsor:delete` | SponsorHandler |

### User Management & RBAC
| Endpoint | Method | Auth | Permission | Handler |
|----------|--------|------|------------|---------|
| `/api/rbac/roles` | GET | ✅ | `user:read` | RBACHandler |
| `/api/rbac/roles` | POST | ✅ | `user:write` | RBACHandler |
| `/api/rbac/roles/:id` | PUT | ✅ | `user:write` | RBACHandler |
| `/api/rbac/roles/:id` | DELETE | ✅ | `user:delete` | RBACHandler |
| `/api/rbac/permissions` | GET | ✅ | `user:read` | RBACHandler |
| `/api/rbac/permissions` | POST | ✅ | `user:write` | RBACHandler |
| `/api/rbac/permissions/:id` | DELETE | ✅ | `user:delete` | RBACHandler |
| `/api/rbac/roles/:roleId/permissions/:permissionId` | POST | ✅ | `user:manage_roles` | RBACHandler |
| `/api/rbac/roles/:roleId/permissions/:permissionId` | DELETE | ✅ | `user:manage_roles` | RBACHandler |
| `/api/users/:userId/roles` | GET | ✅ | `user:read` | RBACHandler |
| `/api/users/:userId/roles` | POST | ✅ | `user:manage_roles` | RBACHandler |
| `/api/users/:userId/roles/:roleId` | DELETE | ✅ | `user:manage_roles` | RBACHandler |
| `/api/users/:userId/permissions` | GET | ✅ | `user:read` | RBACHandler |
| `/api/rbac/cache/refresh` | POST | ✅ | `user:manage_roles` | RBACHandler |

---

## 🎨 Frontend Integration Examples

### Using API Client

```typescript
// src/lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com/api';

class APIClient {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  // Similar for PUT, DELETE...
}

export const api = new APIClient();
```

### Service Layer Examples

```typescript
// Photo Service
export const photoService = {
  getPhotos: (filters?: {year?: number, title?: string}) => {
    const params = new URLSearchParams(filters as any);
    return api.get<Photo[]>(`/photos?${params}`);
  },
  
  getPhoto: (id: string) => 
    api.get<Photo>(`/photos/${id}`),
  
  createPhoto: (data: Partial<Photo>) => 
    api.post<Photo>('/photos', data),
  
  updatePhoto: (id: string, data: Partial<Photo>) => 
    api.put<Photo>(`/photos/${id}`, data),
  
  deletePhoto: (id: string) => 
    api.delete(`/photos/${id}`),
};

// Album Service
export const albumService = {
  getAlbums: (includeCovers = false) => 
    api.get<Album[]>(`/albums?include_covers=${includeCovers}`),
  
  getAlbumPhotos: (albumId: string) => 
    api.get<AlbumPhoto[]>(`/albums/${albumId}/photos`),
  
  createAlbum: (data: Partial<Album>) => 
    api.post<Album>('/albums', data),
  
  addPhotoToAlbum: (albumId: string, photoId: string, orderNumber = 0) =>
    api.post(`/albums/${albumId}/photos`, { photo_id: photoId, order_number: orderNumber }),
  
  reorderPhotos: (albumId: string, photos: {photo_id: string, order_number: number}[]) =>
    api.put(`/albums/${albumId}/photos/reorder`, { photo_order: photos }),
};

// Contact Service
export const contactService = {
  getMessages: (limit = 10, offset = 0) => 
    api.get<Contact[]>(`/contact?limit=${limit}&offset=${offset}`),
  
  getMessagesByStatus: (status: 'nieuw' | 'in_behandeling' | 'beantwoord' | 'gesloten') =>
    api.get<Contact[]>(`/contact/status/${status}`),
  
  updateStatus: (id: string, status: string, notities?: string) =>
    api.put<Contact>(`/contact/${id}`, { status, notities }),
  
  addReply: (id: string, tekst: string) =>
    api.post(`/contact/${id}/antwoord`, { tekst }),
  
  deleteMessage: (id: string) =>
    api.delete(`/contact/${id}`),
};

// Video Service
export const videoService = {
  getVideos: () => 
    api.get<Video[]>('/videos'),
  
  createVideo: (data: Partial<Video>) => 
    api.post<Video>('/videos', data),
  
  updateVideo: (id: string, data: Partial<Video>) => 
    api.put<Video>(`/videos/${id}`, data),
  
  deleteVideo: (id: string) => 
    api.delete(`/videos/${id}`),
};
```

### Component Usage with Permissions

```typescript
// PhotosOverview.tsx
import { usePermissions } from '@/hooks/usePermissions';
import { photoService } from '@/services/photoService';

export const PhotosOverview = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await photoService.getPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const canWrite = hasPermission('photo', 'write');
  const canDelete = hasPermission('photo', 'delete');

  return (
    <div>
      {canWrite && <button onClick={handleAdd}>Add Photo</button>}
      {photos.map(photo => (
        <div key={photo.id}>
          <img src={photo.url} alt={photo.alt_text} />
          {canWrite && <button onClick={() => handleEdit(photo)}>Edit</button>}
          {canDelete && <button onClick={() => handleDelete(photo.id)}>Delete</button>}
        </div>
      ))}
    </div>
  );
};
```

---

## 🔒 RBAC Permission Matrix

| Resource | Read | Write | Delete | Special |
|----------|------|-------|--------|---------|
| `contact` | ✅ List, Get | ✅ Update, Reply | ✅ Delete | - |
| `aanmelding` | ✅ List, Get | ✅ Update, Reply | ✅ Delete | - |
| `photo` | ✅ List, Get | ✅ Create, Update | ✅ Delete | - |
| `album` | ✅ List, Get | ✅ Create, Update, Reorder | ✅ Delete | - |
| `video` | ✅ List, Get | ✅ Create, Update | ✅ Delete | - |
| `partner` | ✅ List, Get | ✅ Create, Update | ✅ Delete | - |
| `sponsor` | ✅ List, Get | ✅ Create, Update | ✅ Delete | - |
| `program_schedule` | ✅ List, Get | ✅ Create, Update | ✅ Delete | - |
| `social_embed` | ✅ List, Get | ✅ Create, Update | ✅ Delete | - |
| `social_link` | ✅ List, Get | ✅ Create, Update | ✅ Delete | - |
| `user` | ✅ List, Get | ✅ Create, Update | ✅ Delete | `manage_roles` |
| `newsletter` | ✅ List, Get | ✅ Create, Update | ✅ Delete | `send` |
| `email` | ✅ List, Get | ✅ Update | ✅ Delete | `fetch` |
| `chat` | ✅ Read messages | ✅ Write messages | - | `manage_channel`, `moderate` |

**See:** [`docs/AUTH_SYSTEM.md`](./AUTH_SYSTEM.md) for complete permission details

---

## 📊 Common Patterns

### Pagination
```typescript
const { data, total } = await api.get<{data: T[], total: number}>(
  `/resource?limit=10&offset=0`
);
```

### Filtering
```typescript
// Photos by year
const photos = await api.get<Photo[]>('/photos?year=2024');

// Contacts by status
const newContacts = await api.get<Contact[]>('/contact/status/nieuw');
```

### Reordering
```typescript
// Reorder albums
await api.put('/albums/reorder', {
  album_order: [
    { id: 'uuid1', order_number: 0 },
    { id: 'uuid2', order_number: 1 }
  ]
});

// Reorder photos in album
await api.put('/albums/:albumId/photos/reorder', {
  photo_order: [
    { photo_id: 'uuid1', order_number: 0 },
    { photo_id: 'uuid2', order_number: 1 }
  ]
});
```

---

## 🚨 Error Handling

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error message here"
}
```

### Frontend Error Handling
```typescript
try {
  const data = await api.get('/photos');
} catch (error) {
  if (error.message.includes('401')) {
    // Token expired - redirect to login
    localStorage.clear();
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // Permission denied - show access denied message
    alert('Geen toegang tot deze functie');
  } else {
    // Other error
    console.error('API Error:', error);
  }
}
```

---

## ✅ Implementation Checklist

### Backend Status (ALL IMPLEMENTED ✅)
- [x] Contact API - Full CRUD with replies
- [x] Photo API - Full CRUD with filtering
- [x] Album API - Full CRUD with photo management
- [x] Video API - Full CRUD
- [x] Partner API - Full CRUD
- [x] All RBAC permissions configured
- [x] Permission middleware on all endpoints
- [x] JWT authentication working

### Frontend Requirements
- [ ] Replace AuthProvider with pure JWT (remove Supabase)
- [ ] Implement usePermissions hook
- [ ] Create API client with auto-auth headers
- [ ] Update all service files to use new API client
- [ ] Add permission checks to all components
- [ ] Test all CRUD operations
- [ ] Verify permission-based UI rendering

---

## 🧪 Testing

### Test Authentication
```bash
# Login
curl -X POST https://dklemailservice.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dekoninklijkeloop.nl","wachtwoord":"password"}'

# Get profile with token
curl https://dklemailservice.onrender.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Contact API
```bash
# List contacts (requires contact:read permission)
curl https://dklemailservice.onrender.com/api/contact \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update contact status (requires contact:write permission)
curl -X PUT https://dklemailservice.onrender.com/api/contact/UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_behandeling"}'
```

### Test Photos API
```bash
# Public endpoint - no auth
curl https://dklemailservice.onrender.com/api/photos?year=2024

# Admin endpoint - requires photo:read
curl https://dklemailservice.onrender.com/api/photos/admin \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Related Documentation

- **[`docs/AUTH_SYSTEM.md`](./AUTH_SYSTEM.md)** - Complete RBAC & JWT documentation
- **[`docs/FRONTEND_AUTH_FIX_COMPLETE.md`](./FRONTEND_AUTH_FIX_COMPLETE.md)** - Frontend auth implementation guide
- **[`docs/FRONTEND_API_REFERENCE.md`](./FRONTEND_API_REFERENCE.md)** - Legacy API reference

---

## 🎯 Quick Start for Frontend

1. **Set environment variable:**
   ```bash
   # .env.development
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

2. **Implement AuthProvider** (see [`FRONTEND_AUTH_FIX_COMPLETE.md`](./FRONTEND_AUTH_FIX_COMPLETE.md))

3. **Create API client:**
   ```typescript
   import { API_BASE_URL } from '@/config';
   
   export const api = {
     get: async <T>(endpoint: string) => {
       const token = localStorage.getItem('auth_token');
       const res = await fetch(`${API_BASE_URL}${endpoint}`, {
         headers: {
           'Authorization': `Bearer ${token}`,
         },
       });
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       return res.json() as Promise<T>;
     },
     // ... post, put, delete
   };
   ```

4. **Use in components:**
   ```typescript
   const photos = await api.get<Photo[]>('/photos');
   const album = await api.post<Album>('/albums', { title: 'New Album' });
   ```

---

**Status:** ✅ Backend Fully Implemented  
**Frontend:** ⏳ Awaiting Auth Fix  
**Version:** V1.48.0  
**Last Updated:** 2025-11-01