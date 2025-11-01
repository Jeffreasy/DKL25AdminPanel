# 🔧 Backend API Requirements - DKL25 Admin Panel

**Status**: Ready for Implementation  
**Priority**: High  
**Version**: 1.0  
**Date**: 2025-11-01

---

## 📋 Overview

De frontend heeft API clients klaar voor Contact, Video, Album en Partner resources. De volgende backend endpoints moeten geïmplementeerd worden om volledige backend integratie te bereiken.

---

## 🎯 Required Endpoints

### 1. Contact API (`/api/contact`)

**Permissions Required**: `contact:read`, `contact:write`, `contact:delete`

#### GET /api/contact
Haal alle contactberichten op
```json
Response: ContactMessage[]
[
  {
    "id": "uuid",
    "naam": "Jan Jansen",
    "email": "jan@example.com",
    "onderwerp": "Vraag over evenement",
    "bericht": "Ik heb een vraag...",
    "status": "nieuw",
    "email_verzonden": false,
    "email_verzonden_op": null,
    "privacy_akkoord": true,
    "notities": "",
    "behandeld_door": null,
    "behandeld_op": null,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

#### GET /api/contact/:id
Haal specifiek contactbericht op
```json
Response: ContactMessage
```

#### PUT /api/contact/:id/status
Update message status
```json
Request: { "status": "in_behandeling" | "afgehandeld" }
Response: ContactMessage
```

#### DELETE /api/contact/:id
Verwijder contactbericht
```json
Response: 204 No Content
```

#### GET /api/contact/stats
Statistieken voor dashboard
```json
Response: {
  "counts": {
    "total": 150,
    "new": 10,
    "inProgress": 5,
    "handled": 135
  },
  "avgResponseTime": 2.5,
  "messagesByPeriod": {
    "daily": 3,
    "weekly": 15,
    "monthly": 45
  }
}
```

**Frontend Client**: [`contactClient.ts`](../../src/api/client/contactClient.ts)

---

### 2. Video API (`/api/videos`)

** Permissions Required**: `video:read`, `video:write`, `video:delete`

#### GET /api/videos
Haal alle videos op
```json
Response: Video[]
[
  {
    "id": "uuid",
    "title": "Highlights 2024",
    "description": "Beste momenten van 2024",
    "url": "https://youtube.com/watch?v=...",
    "video_id": "youtube_id",
    "thumbnail_url": "https://...",
    "visible": true,
    "order_number": 0,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

#### GET /api/videos/:id
Haal specifieke video op
```json
Response: Video
```

#### POST /api/videos
Maak nieuwe video aan
```json
Request: {
  "title": "Video Title",
  "description": "Optional description",
  "url": "https://youtube.com/watch?v=...",
  "visible": true,
  "order_number": 0
}
Response: Video
```

#### PUT /api/videos/:id
Update video
```json
Request: {
  "title": "Updated Title",
  "description": "Updated description",
  "url": "https://...",
  "visible": false,
  "order_number": 1
}
Response: Video
```

#### DELETE /api/videos/:id
Verwijder video
```json
Response: 204 No Content
```

#### PUT /api/videos/reorder
Bulk reorder videos
```json
Request: {
  "videos": [
    { "id": "uuid1", "order_number": 0 },
    { "id": "uuid2", "order_number": 1 },
    { "id": "uuid3", "order_number": 2 }
  ]
}
Response: 200 OK
```

**Frontend Client**: [`videoClient.ts`](../../src/api/client/videoClient.ts)

---

### 3. Album API (`/api/albums`)

**Permissions Required**: `album:read`, `album:write`, `album:delete`

#### GET /api/albums
Haal alle albums op (met photo counts)
```json
Response: Album[]
[
  {
    "id": "uuid",
    "title": "Zomer 2024",
    "description": "Foto's van het zomerevent",
    "cover_photo_id": "photo_uuid",
    "visible": true,
    "order_number": 0,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z",
    "photos_count": 25
  }
]
```

#### GET /api/albums/:id
Haal specifiek album op (inclusief photos)
```json
Response: Album & {
  "photos": [
    {
      "album_id": "album_uuid",
      "photo_id": "photo_uuid",
      "order_number": 0,
      "photo": { Photo object }
    }
  ]
}
```

#### POST /api/albums
Maak nieuw album aan
```json
Request: {
  "title": "Album Title",
  "description": "Optional description",
  "cover_photo_id": "photo_uuid",
  "visible": true,
  "order_number": 0
}
Response: Album
```

#### PUT /api/albums/:id
Update album
```json
Request: {
  "title": "Updated Title",
  "description": "Updated description",
  "cover_photo_id": "new_photo_uuid",
  "visible": false
}
Response: Album
```

#### DELETE /api/albums/:id
Verwijder album
```json
Response: 204 No Content
```

#### POST /api/albums/:albumId/photos
Voeg photos toe aan album
```json
Request: {
  "photo_ids": ["photo_uuid1", "photo_uuid2"]
}
Response: 200 OK
```

#### DELETE /api/albums/:albumId/photos/:photoId
Verwijder photo uit album
```json
Response: 204 No Content
```

#### PUT /api/albums/reorder
Bulk reorder albums
```json
Request: {
  "albums": [
    { "id": "uuid1", "order_number": 0 },
    { "id": "uuid2", "order_number": 1 }
  ]
}
Response: 200 OK
```

#### PUT /api/albums/:albumId/photos/reorder
Reorder photos binnen album
```json
Request: {
  "photos": [
    { "photo_id": "uuid1", "order_number": 0 },
    { "photo_id": "uuid2", "order_number": 1 }
  ]
}
Response: 200 OK
```

**Frontend Client**: [`albumClient.ts`](../../src/api/client/albumClient.ts)

---

### 4. Partner API (`/api/partners`)

**Permissions Required**: `partner:read`, `partner:write`, `partner:delete`

#### GET /api/partners
Haal alle partners op
```json
Response: Partner[]
[
  {
    "id": "uuid",
    "name": "Partner BV",
    "description": "Premium partner sinds 2020",
    "logo": "https://cloudinary.../logo.png",
    "website": "https://partner.nl",
    "tier": "gold",
    "since": "2020-01-15",
    "visible": true,
    "order_number": 0,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z"
  }
]
```

#### GET /api/partners/:id
Haal specifieke partner op
```json
Response: Partner
```

#### POST /api/partners
Maak nieuwe partner aan
```json
Request: {
  "name": "Partner Name",
  "description": "Optional description",
  "logo": "https://cloudinary.../logo.png",
  "website": "https://partner.nl",
  "tier": "bronze" | "silver" | "gold",
  "since": "2024-01-01",
  "visible": true,
  "order_number": 0
}
Response: Partner
```

#### PUT /api/partners/:id
Update partner
```json
Request: {
  "name": "Updated Name",
  "tier": "gold",
  "visible": false
}
Response: Partner
```

#### DELETE /api/partners/:id
Verwijder partner
```json
Response: 204 No Content
```

#### PUT /api/partners/reorder
Bulk reorder partners
```json
Request: {
  "partners": [
    { "id": "uuid1", "order_number": 0 },
    { "id": "uuid2", "order_number": 1 }
  ]
}
Response: 200 OK
```

**Frontend Client**: [`partnerClient.ts`](../../src/api/client/partnerClient.ts)

---

## 🔒 Permission Middleware

Alle endpoints MOETEN permission middleware gebruiken:

```go
// Example in Go Fiber
app.Get("/api/contact", 
    AuthMiddleware,
    PermissionMiddleware(permissionService, "contact", "read"),
    contactHandler.GetMessages
)

app.Put("/api/contact/:id/status",
    AuthMiddleware,
    PermissionMiddleware(permissionService, "contact", "write"),
    contactHandler.UpdateStatus
)

app.Delete("/api/contact/:id",
    AuthMiddleware,
    PermissionMiddleware(permissionService, "contact", "delete"),
    contactHandler.DeleteMessage
)
```

---

## 📊 Database Schema Reference

### Contact Messages
```sql
CREATE TABLE contact_berichten (
    id UUID PRIMARY KEY,
    naam VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    onderwerp VARCHAR(255),
    bericht TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'nieuw',
    email_verzonden BOOLEAN DEFAULT FALSE,
    email_verzonden_op TIMESTAMP,
    privacy_akkoord BOOLEAN DEFAULT TRUE,
    notities TEXT,
    behandeld_door VARCHAR(255),
    behandeld_op TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Videos
```sql
CREATE TABLE videos (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    video_id VARCHAR(255),
    thumbnail_url TEXT,
    visible BOOLEAN DEFAULT TRUE,
    order_number INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Albums
```sql
CREATE TABLE albums (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES photos(id),
    visible BOOLEAN DEFAULT TRUE,
    order_number INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE album_photos (
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    order_number INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (album_id, photo_id)
);
```

### Partners
```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo TEXT,
    website VARCHAR(500),
    tier VARCHAR(20) CHECK (tier IN ('bronze', 'silver', 'gold')),
    since DATE NOT NULL,
    visible BOOLEAN DEFAULT TRUE,
    order_number INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Implementation Checklist

### Contact Endpoints
- [ ] GET /api/contact
- [ ] GET /api/contact/:id
- [ ] PUT /api/contact/:id/status
- [ ] DELETE /api/contact/:id
- [ ] GET /api/contact/stats

### Video Endpoints
- [ ] GET /api/videos
- [ ] GET /api/videos/:id
- [ ] POST /api/videos
- [ ] PUT /api/videos/:id
- [ ] DELETE /api/videos/:id
- [ ] PUT /api/videos/reorder

### Album Endpoints
- [ ] GET /api/albums
- [ ] GET /api/albums/:id
- [ ] POST /api/albums
- [ ] PUT /api/albums/:id
- [ ] DELETE /api/albums/:id
- [ ] POST /api/albums/:albumId/photos
- [ ] DELETE /api/albums/:albumId/photos/:photoId
- [ ] PUT /api/albums/reorder
- [ ] PUT /api/albums/:albumId/photos/reorder

### Partner Endpoints
- [ ] GET /api/partners
- [ ] GET /api/partners/:id
- [ ] POST /api/partners
- [ ] PUT /api/partners/:id
- [ ] DELETE /api/partners/:id
- [ ] PUT /api/partners/reorder

---

## 🔗 Frontend Integration

**Frontend Clients Ready**:
- ✅ [`contactClient.ts`](../../src/api/client/contactClient.ts) - 109 LOC
- ✅ [`videoClient.ts`](../../src/api/client/videoClient.ts) - 125 LOC
- ✅ [`albumClient.ts`](../../src/api/client/albumClient.ts) - 164 LOC
- ✅ [`partnerClient.ts`](../../src/api/client/partnerClient.ts) - 128 LOC

**Usage Example**:
```typescript
import { contactClient, videoClient } from '@/api/client';

// Contact
const messages = await contactClient.getMessages();
await contactClient.updateMessageStatus(id, 'afgehandeld');

// Videos
const videos = await videoClient.getVideos();
await videoClient.reorderVideos([
  { id: 'uuid1', order_number: 0 },
  { id: 'uuid2', order_number: 1 }
]);
```

---

## 🎨 Response Format

Alle endpoints moeten consistent response format gebruiken:

**Success (200/201)**:
```json
{
  "success": true,
  "data": { /* resource */ }
}
```

**Error (400/401/403/500)**:
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Validation Error (422)**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

---

## 🔐 Security Requirements

### Authentication
- Alle endpoints vereisen `Authorization: Bearer {JWT token}`
- Token moet RBAC claims bevatten (zie [`Auth_system.md`](./architecture/Auth_system.md))

### Permission Checks
- **Read endpoints**: Check `resource:read` permission
- **Write endpoints**: Check `resource:write` permission
- **Delete endpoints**: Check `resource:delete` permission

### Validation
- Input sanitization voor alle POST/PUT endpoints
- Email format validation
- URL validation voor website/video links
- XSS protection via backend validation

---

## 📝 Implementation Notes

### Video URL Processing
Frontend extracts embed URLs from:
- YouTube (`youtube.com`, `youtu.be`)
- Vimeo (`vimeo.com`)
- Streamable (`streamable.com`)

Backend should store original URL and let frontend handle embed conversion.

### Order Number Management
- Use `order_number` field for drag-drop sorting
- Bulk reorder endpoints should update multiple records atomically
- Return updated records after reorder

### Soft Deletes (Optional)
Consider soft deletes for Contact, Video, Album:
```sql
ALTER TABLE videos ADD COLUMN deleted_at TIMESTAMP;
```

---

## 🧪 Testing

### Manual Testing with curl

```bash
# Contact
curl -X GET https://api.dekoninklijkeloop.nl/api/contact \
  -H "Authorization: Bearer YOUR_TOKEN"

# Video
curl -X POST https://api.dekoninklijkelop.nl/api/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Video","url":"https://youtube.com/watch?v=test","visible":true}'

# Album
curl -X GET https://api.dekoninklijkeloop.nl/api/albums \
  -H "Authorization: Bearer YOUR_TOKEN"

# Partner
curl -X GET https://api.dekoninklijkeloop.nl/api/partners \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

##  🚀 Deployment Order

**Recommended**:
1. **Contact API** - Hoogste prioriteit (gebruikt in dashboard)
2. **Video API** - Veel gebruikt, drag-drop functionaliteit
3. **Album API** - Photo management afhankelijkheid
4. **Partner API** - Standalone, kan parallel

---

## 📚 Related Documentation

- [Auth System](./architecture/Auth_system.md) - JWT & Permission structure
- [RBAC Frontend](./architecture/RBAC_FRONTEND.md) - Frontend integration
- [API Integration Guide](./guides/api-integration.md) - Best practices

---

**Status**: ⏳ Waiting for Backend Implementation  
**Frontend**: ✅ Ready  
**Last Updated**: 2025-11-01