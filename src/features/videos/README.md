# Videos Feature

Deze feature verzorgt het beheer van video's voor de Koninklijke Loop applicatie.

## Architectuur

De videos feature is volledig gerefactored volgens moderne React patterns en best practices:

### 📁 Directory Structuur

```
src/features/videos/
├── components/           # UI Components
│   ├── VideoCard.tsx        # Individuele video kaart
│   ├── VideoForm.tsx        # Formulier voor toevoegen/bewerken
│   ├── VideoList.tsx        # Lijst van videos met drag-and-drop
│   ├── BulkActions.tsx      # Bulk operaties (verwijderen)
│   ├── SearchAndSort.tsx    # Zoek en sorteer functionaliteit
│   ├── VideosOverview.tsx   # Hoofd component (simplified view)
│   └── index.ts            # Component exports
├── hooks/               # Custom React Hooks
│   ├── useVideos.ts        # Video CRUD operaties
│   ├── useVideoForm.ts     # Form state management
│   ├── useVideoSelection.ts # Selectie logica
│   ├── useVideoDragDrop.ts  # Drag & drop functionaliteit
│   ├── __tests__/          # Hook tests
│   └── index.ts            # Hook exports
├── services/            # API Services
│   ├── videoService.ts     # Backend communicatie
│   ├── __tests__/         # Service tests
│   └── index.ts
├── utils/               # Utility Functions
│   ├── videoUrlUtils.ts    # URL validatie en transformatie
│   ├── __tests__/         # Utility tests
│   └── index.ts
├── types.ts            # TypeScript types
├── index.ts            # Feature exports
└── README.md           # Deze file
```

## Backend Integratie

### API Endpoint

De feature communiceert met de backend via:
- **Development:** `http://localhost:8082/api/videos`
- **Production:** `https://dklemailservice.onrender.com/api/videos`

### Video Platform

Alle videos worden gehost op **Streamable**:
- URLs zijn embed-ready: `https://streamable.com/e/{video_id}`
- Thumbnails zijn beschikbaar via: `https://cdn-cf-east.streamable.com/image/{video_id}.jpg`
- Geen API key nodig voor publieke videos

### Data Model

```typescript
interface Video {
  id: string;              // UUID
  video_id: string;        // Streamable video ID
  url: string;             // Embed URL
  title: string;           // Titel
  description: string | null;
  thumbnail_url: string | null;
  visible: boolean;
  order_number: number;    // Voor sortering
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

## Components

### VideosOverview

Simplified overzicht component voor video beheer:
- Drag-and-drop voor volgorde aanpassen
- Zoeken en filteren
- Bulk operaties
- Inline bewerken

**Gebruik:**
```tsx
import { VideosOverview } from '@/features/videos'

function VideoPage() {
  return <VideosOverview />
}
```

### VideoManagementPage

Uitgebreide management pagina met tabel layout:
- Responsive design (card view op mobile, table op desktop)
- Permission-based actions
- Modal form voor bewerken
- Checkbox selectie voor bulk operaties

**Gebruik:**
```tsx
import { VideoManagementPage } from '@/pages/VideoManagementPage'

// Gebruikt in routing
```

## Custom Hooks

### useVideos

Centraal hook voor alle video operaties:

```typescript
const {
  videos,           // Video[] - Alle videos
  loading,          // boolean - Laad status
  error,            // string | null - Foutmelding
  loadVideos,       // () => Promise<void> - Herlaad videos
  createVideo,      // (video: VideoInsert) => Promise<void>
  updateVideoData,  // (id: string, updates: Partial<Video>) => Promise<void>
  removeVideo,      // (id: string) => Promise<void>
  removeVideos,     // (ids: string[]) => Promise<void>
  toggleVisibility, // (video: Video) => Promise<void>
  setVideos         // State setter voor optimistische updates
} = useVideos()
```

### useVideoForm

Form state management met validatie:

```typescript
const {
  formData,         // VideoFormData - Huidige form data
  isSubmitting,     // boolean - Submit status
  showForm,         // boolean - Form zichtbaarheid
  editingVideo,     // Video | null - Video being edited
  formError,        // string | null - Validatie fout
  setFormData,      // State setter
  setIsSubmitting,  // State setter
  openForm,         // () => void - Open nieuw form
  closeForm,        // () => void - Sluit form
  openEditForm,     // (video: Video) => void - Open edit form
  validateForm,     // () => boolean - Valideer form
  resetForm         // () => void - Reset form
} = useVideoForm()
```

### useVideoSelection

Selectie logica met "select all" ondersteuning:

```typescript
const {
  selectedVideos,   // Set<string> - Geselecteerde video IDs
  selectAllRef,     // RefObject<HTMLInputElement> - Ref voor select-all checkbox
  handleSelectVideo,// (videoId: string) => void
  handleSelectAll,  // (videos: Video[]) => void
  clearSelection,   // () => void
  isSelected,       // (videoId: string) => boolean
  hasSelection,     // boolean
  selectionCount    // number
} = useVideoSelection(videos)
```

### useVideoDragDrop

Drag-and-drop functionaliteit:

```typescript
const {
  isDragging,       // boolean
  handleDragEnd     // (result: DropResult, videos, setVideos, canWrite) => Promise<void>
} = useVideoDragDrop()
```

## Utilities

### videoUrlUtils

URL validatie en transformatie voor Streamable:

```typescript
// Platform detectie
detectVideoPlatform(url: string): 'youtube' | 'vimeo' | 'streamable' | 'unknown'

// Embed URL generatie
getVideoEmbedUrl(url: string): string

// URL validatie
isValidVideoUrl(url: string): boolean

// Platform naam
getPlatformDisplayName(url: string): string
```

**Voorbeeld:**
```typescript
import { getVideoEmbedUrl, isValidVideoUrl } from '@/features/videos/utils'

const url = 'https://streamable.com/q9ngqu'
const embedUrl = getVideoEmbedUrl(url)  // "https://streamable.com/e/q9ngqu"
const isValid = isValidVideoUrl(url)     // true
```

## Services

### videoService

CRUD operaties via backend API:

```typescript
// Ophalen
fetchVideos(): Promise<{ data: Video[], error: Error | null }>

// Aanmaken
addVideo(video: VideoInsert): Promise<{ data: Video | null, error: Error | null }>

// Updaten
updateVideo(id: string, updates: Partial<Video>): Promise<{ error: Error | null }>

// Verwijderen
deleteVideo(id: string): Promise<{ error: Error | null }>

// Volgorde updaten
updateVideoOrder(id: string, newOrder: number): Promise<{ error: Error | null }>
```

## Features

### ✅ Geïmplementeerd

- [x] Video CRUD operaties
- [x] Drag-and-drop volgorde aanpassing
- [x] Zoeken en filteren
- [x] Bulk verwijderen
- [x] Inline zichtbaarheid toggle
- [x] Modal forms voor bewerken
- [x] Responsive design (mobile + desktop)
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Permission-based actions (RBAC)
- [x] Optimistische UI updates
- [x] Comprehensive tests
- [x] Backend bulk reorder endpoint integratie

## Best Practices

### 1. Separation of Concerns

Elke laag heeft een duidelijke verantwoordelijkheid:
- **Components**: UI rendering
- **Hooks**: State management en side effects
- **Services**: API communicatie
- **Utils**: Pure functions en helpers

### 2. Type Safety

Volledige TypeScript coverage met strikte types:
```typescript
// ✅ Goed - specifieke types
const video: Video = ...

// ❌ Slecht - any types
const video: any = ...
```

### 3. Error Handling

Consistente error handling op elke laag:
```typescript
try {
  await operation()
  toast.success('Success!')
} catch (error) {
  console.error('Error:', error)
  toast.error('Failed!')
  throw error // Re-throw voor parent handlers
}
```

### 4. Optimistic Updates

UI updates direct, met rollback bij fouten:
```typescript
// Update UI optimistisch
setVideos(updatedVideos)

try {
  await api.update()
} catch (error) {
  // Rollback bij fout
  setVideos(originalVideos)
}
```

### 5. Accessibility

Correcte ARIA labels en semantic HTML:
```tsx
<button
  aria-label="Selecteer video"
  title="Klik om te selecteren"
>
  ...
</button>
```

## Testing

Comprehensive test coverage voor:
- Utils: URL validatie en transformatie
- Hooks: State management en side effects
- Components: Rendering en interacties
- Services: API communicatie

**Tests draaien:**
```bash
npm test src/features/videos
```

## Permissions

De feature gebruikt RBAC (Role-Based Access Control):

- `video:read` - Videos bekijken
- `video:write` - Videos toevoegen/bewerken
- `video:delete` - Videos verwijderen

**Voorbeeld:**
```tsx
import { usePermissions } from '@/hooks/usePermissions'

const { hasPermission } = usePermissions()
const canEdit = hasPermission('video', 'write')
```

## Styling

Gebruikt gedeelde style utilities:
```typescript
import { cc } from '@/styles/shared'

<button className={cc.button.base({ color: 'primary' })}>
  Toevoegen
</button>
```

Ondersteunt dark mode via Tailwind CSS classes.

## Future Enhancements

### Prioriteit Hoog
1. Backend bulk reorder endpoint implementeren
2. Video preview thumbnails optimaliseren
3. Batch upload functionaliteit

### Prioriteit Medium
4. Video analytics (views, plays)
5. Video categorieën/tags
6. Advanced search filters
7. Export functionaliteit

### Prioriteit Laag
8. Video transcoding opties
9. Playlist functionaliteit
10. Social share buttons

## Troubleshooting

### Videos laden niet

1.  Check backend status (`/api/videos` endpoint)
2. Verify CORS settings
3. Check browser console voor errors

### Drag-and-drop werkt niet

1. Verify `video:write` permission
2. Check if backend reorder endpoint is available
3. Disable in mobile view (< 768px)

### Form validatie faalt

1. Check URL format (moet https://streamable.com zijn)
2. Verify required fields (title, url)
3. Check backend validation messages

## Contact

Voor vragen of problemen:
- Check de inline documentatie in de code
- Raadpleeg de tests voor usage examples
- Contact het development team

---

**Laatste update:** November 2024
**Status:** ✅ Production Ready