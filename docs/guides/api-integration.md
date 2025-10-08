# 🔌 API Integration Guide

> **Versie:** 1.0 | **Status:** Complete | **Laatste Update:** 2025-01-08

Complete guide voor API integratie met Supabase en Cloudinary.

---

## 📋 Inhoudsopgave

- [Overzicht](#-overzicht)
- [Supabase Integration](#-supabase-integration)
- [Cloudinary Integration](#-cloudinary-integration)
- [API Client Setup](#-api-client-setup)
- [Error Handling](#-error-handling)
- [Best Practices](#-best-practices)

---

## 🎯 Overzicht

Het DKL25 Admin Panel integreert met twee primaire backend services:

- **Supabase** - Database, authenticatie en real-time features
- **Cloudinary** - Media storage en transformatie

---

## 🗄️ Supabase Integration

### Client Setup

**Locatie:** [`src/api/client/supabase.ts`](../../src/api/client/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Database Operations

#### Fetch Data
```typescript
const { data, error } = await supabase
  .from('photos')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50)

if (error) throw error
return data
```

#### Insert Data
```typescript
const { data, error } = await supabase
  .from('photos')
  .insert({
    title: 'Photo Title',
    url: 'https://...',
    visible: true
  })
  .select()
  .single()
```

#### Update Data
```typescript
const { error } = await supabase
  .from('photos')
  .update({ title: 'New Title' })
  .eq('id', photoId)
```

#### Delete Data
```typescript
const { error } = await supabase
  .from('photos')
  .delete()
  .eq('id', photoId)
```

### Case Conversion

**Belangrijk:** Supabase gebruikt snake_case, TypeScript gebruikt camelCase

```typescript
import { keysToCamel, keysToSnake } from '@/utils/caseConverter'

// Database → TypeScript
const { data } = await supabase.from('photos').select('*')
const photos = data.map(photo => keysToCamel<Photo>(photo))

// TypeScript → Database
const dbData = keysToSnake(formData)
await supabase.from('photos').insert(dbData)
```

### Real-time Subscriptions

```typescript
const subscription = supabase
  .channel('photos')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'photos' },
    (payload) => {
      console.log('Change received!', payload)
      // Update local state
    }
  )
  .subscribe()

// Cleanup
return () => {
  subscription.unsubscribe()
}
```

---

## 📸 Cloudinary Integration

### Client Setup

**Locatie:** [`src/api/client/cloudinary.ts`](../../src/api/client/cloudinary.ts)

```typescript
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  return await response.json()
}
```

### Upload Functions

#### Photo Upload
```typescript
export async function uploadPhoto(file: File): Promise<string> {
  const result = await uploadToCloudinary(file)
  return result.secure_url
}
```

#### Logo Upload
```typescript
export async function uploadLogo(file: File): Promise<string> {
  const result = await uploadToCloudinary(file)
  return result.secure_url
}
```

### Image Transformations

```typescript
// Thumbnail URL
const thumbnailUrl = photo.url.replace(
  '/upload/',
  '/upload/w_300,h_300,c_fill/'
)

// Optimized URL
const optimizedUrl = photo.url.replace(
  '/upload/',
  '/upload/f_auto,q_auto/'
)
```

### Cloudinary Widget

```typescript
import { openCloudinaryWidget } from '@/api/client/cloudinary'

const handleImport = () => {
  openCloudinaryWidget({
    cloudName: CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET,
    multiple: true,
    onSuccess: (results) => {
      // Handle uploaded files
      results.forEach(result => {
        console.log('Uploaded:', result.secure_url)
      })
    }
  })
}
```

---

## 🔧 API Client Setup

### CRUD Service Pattern

**Locatie:** [`src/lib/services/createCRUDService.ts`](../../src/lib/services/createCRUDService.ts)

```typescript
import { createCRUDService } from '@/lib/services/createCRUDService'

const photoService = createCRUDService<Photo>({
  tableName: 'photos',
  orderBy: 'created_at',
  orderDirection: 'desc'
})

export const {
  fetchAll: getPhotos,
  fetchById: getPhotoById,
  create: createPhoto,
  update: updatePhoto,
  delete: deletePhoto
} = photoService
```

### Custom Service Methods

```typescript
// Extend CRUD service met custom methods
export const photoService = {
  ...createCRUDService<Photo>({ tableName: 'photos' }),
  
  // Custom method
  async getPhotosByYear(year: number) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('year', year)
    
    if (error) throw error
    return data.map(photo => keysToCamel<Photo>(photo))
  }
}
```

---

## ⚠️ Error Handling

### API Error Handler

**Locatie:** [`src/utils/apiErrorHandler.ts`](../../src/utils/apiErrorHandler.ts)

```typescript
import { handleApiError } from '@/utils/apiErrorHandler'

try {
  await photoService.createPhoto(data)
} catch (error) {
  const message = handleApiError(error)
  toast.error(message)
}
```

### Common Error Patterns

```typescript
// Supabase errors
if (error) {
  if (error.code === '23505') {
    // Unique constraint violation
    toast.error('Dit item bestaat al')
  } else if (error.code === '23503') {
    // Foreign key violation
    toast.error('Kan niet verwijderen: item is in gebruik')
  } else {
    toast.error('Er is een fout opgetreden')
  }
}

// Cloudinary errors
if (response.error) {
  toast.error('Upload mislukt: ' + response.error.message)
}
```

---

## 🎯 Best Practices

### 1. Gebruik CRUD Service

✅ **GOED:**
```typescript
const service = createCRUDService<Entity>({ tableName: 'entities' })
```

❌ **VERMIJD:**
```typescript
// Handmatige CRUD implementatie
```

### 2. Case Conversion

✅ **GOED:**
```typescript
const data = keysToCamel<Photo>(dbRecord)
const dbData = keysToSnake(formData)
```

❌ **VERMIJD:**
```typescript
// Handmatige property mapping
```

### 3. Error Handling

✅ **GOED:**
```typescript
try {
  await service.create(data)
  toast.success('Opgeslagen!')
} catch (error) {
  toast.error(handleApiError(error))
}
```

### 4. Loading States

✅ **GOED:**
```typescript
const [loading, setLoading] = useState(false)

try {
  setLoading(true)
  await service.create(data)
} finally {
  setLoading(false)
}
```

---

## 📊 Performance Tips

### 1. Batch Operations

```typescript
// ✅ GOED - Batch insert
const { error } = await supabase
  .from('photos')
  .insert(photos)

// ❌ VERMIJD - Individual inserts
for (const photo of photos) {
  await supabase.from('photos').insert(photo)
}
```

### 2. Select Only Needed Fields

```typescript
// ✅ GOED
const { data } = await supabase
  .from('photos')
  .select('id, title, url')

// ❌ VERMIJD
const { data } = await supabase
  .from('photos')
  .select('*')
```

### 3. Use Pagination

```typescript
const { data } = await supabase
  .from('photos')
  .select('*')
  .range(0, 49)  // First 50 items
```

---

## 📚 Referenties

### API Clients
- [`src/api/client/supabase.ts`](../../src/api/client/supabase.ts)
- [`src/api/client/cloudinary.ts`](../../src/api/client/cloudinary.ts)
- [`src/api/client/auth.ts`](../../src/api/client/auth.ts)

### Services
- [`src/lib/services/createCRUDService.ts`](../../src/lib/services/createCRUDService.ts)
- Feature services in `src/features/*/services/`

### Utilities
- [`src/utils/caseConverter.ts`](../../src/utils/caseConverter.ts)
- [`src/utils/apiErrorHandler.ts`](../../src/utils/apiErrorHandler.ts)

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Status:** Complete