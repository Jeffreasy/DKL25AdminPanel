# Albums Feature

Comprehensive album management system with photo organization, drag-and-drop sorting, and public gallery preview capabilities.

## Architecture

### Directory Structure

```
albums/
├── components/          # React components
│   ├── detail/         # Album detail view components
│   ├── display/        # Album grid and card components
│   ├── forms/          # Form components for creating/editing
│   ├── preview/        # Public gallery preview components
│   ├── ErrorBoundary.tsx
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useAlbumData.ts        # Data fetching hook
│   ├── useAlbumMutations.ts   # CRUD operations hook
│   ├── usePhotoSelection.ts   # Photo selection logic
│   └── index.ts
├── services/           # API services
│   ├── albumService.ts
│   └── __tests__/
├── types.ts            # TypeScript type definitions
├── index.ts            # Main module export
└── README.md
```

## Key Features

### 1. **Custom Hooks for State Management**

#### `useAlbumData`
Manages album data fetching with loading and error states.

```typescript
const { album, albums, loading, error, refresh } = useAlbumData({
  albumId: 'optional-id',
  autoLoad: true
})
```

#### `useAlbumMutations`
Handles all CRUD operations for albums.

```typescript
const {
  create,
  update,
  remove,
  addPhotos,
  removePhoto,
  updateCoverPhoto,
  toggleVisibility,
  creating,
  updating,
  deleting,
  error
} = useAlbumMutations()
```

#### `usePhotoSelection`
Manages photo selection state with multi-select support.

```typescript
const {
  selectedPhotoIds,
  isSelected,
  toggleSelection,
  selectAll,
  clearSelection
} = usePhotoSelection({ multiSelect: true })
```

### 2. **Optimized Components**

#### Display Components
- **AlbumCard**: Memoized card component with drag-and-drop support
- **AlbumGrid**: Optimized grid with debounced search and filtering

#### Detail Components
- **AlbumDetailModal**: Refactored modal with reduced complexity
- **AlbumDetailHeader**: Header with visibility toggle
- **AlbumDetailInfo**: Album information display
- **AlbumDetailActions**: Action buttons
- **AlbumDetailPhotos**: Photo management with drag-and-drop ordering

#### Form Components
- **AlbumForm**: Create/edit album form using custom hooks
- **PhotoSelector**: Multi-select photo picker with live search
- **CoverPhotoSelector**: Select cover photo from album photos
- **PhotoOrderer**: Drag-and-drop photo reordering

#### Preview Components
- **PhotoGalleryPreview**: Public gallery preview
- **MainSlider**: Main photo slider with navigation
- **ThumbnailSlider**: Thumbnail navigation
- **ImageModal**: Full-screen image viewer

### 3. **Enhanced Service Layer**

#### Error Handling
Custom `AlbumServiceError` class for consistent error handling:

```typescript
throw new AlbumServiceError('Authenticatie verlopen', 'AUTH_EXPIRED', 401)
```

#### Caching
Built-in cache for public gallery data (5-minute TTL):

```typescript
const galleries = await fetchPublicGalleryData(useCache = true)
```

#### Data Normalization
Automatic normalization of album data to ensure consistent structure.

## Usage Examples

### Creating an Album

```typescript
import { useAlbumMutations } from '@/features/albums'

function CreateAlbumButton() {
  const { create, creating, error } = useAlbumMutations()
  
  const handleCreate = async () => {
    try {
      await create({
        title: 'New Album',
        description: 'Album description',
        visible: true
      })
    } catch (err) {
      console.error('Failed to create album:', err)
    }
  }
  
  return (
    <button onClick={handleCreate} disabled={creating}>
      {creating ? 'Creating...' : 'Create Album'}
    </button>
  )
}
```

### Loading Albums

```typescript
import { useAlbumData } from '@/features/albums'

function AlbumList() {
  const { albums, loading, error, refresh } = useAlbumData()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {albums.map(album => (
        <div key={album.id}>{album.title}</div>
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}
```

### Managing Photos

```typescript
import { useAlbumMutations } from '@/features/albums'

function PhotoManagement({ albumId }) {
  const { addPhotos, removePhoto, updating } = useAlbumMutations()
  
  const handleAddPhotos = async (photoIds: string[]) => {
    await addPhotos(albumId, photoIds)
  }
  
  const handleRemovePhoto = async (photoId: string) => {
    await removePhoto(albumId, photoId)
  }
  
  return (
    // Your component JSX
  )
}
```

## Optimization Highlights

### Performance
- ✅ React.memo for expensive components (AlbumCard)
- ✅ useMemo for computed values
- ✅ useCallback for event handlers
- ✅ Debounced search (300ms)
- ✅ Image lazy loading
- ✅ Optimistic UI updates

### Code Quality
- ✅ Custom hooks for separation of concerns
- ✅ Consistent error handling
- ✅ TypeScript for type safety
- ✅ Comprehensive JSDoc comments
- ✅ Centralized cache management

### User Experience
- ✅ Drag-and-drop album ordering
- ✅ Drag-and-drop photo ordering
- ✅ Real-time search and filtering
- ✅ Loading states and error messages
- ✅ Optimistic updates with rollback
- ✅ Toast notifications for actions

## API Integration

The module integrates with the backend API through `albumClient`:

```typescript
// Available endpoints
albumClient.getAlbumsAdmin()              // Get all albums (admin)
albumClient.getAlbum(id)                  // Get single album
albumClient.createAlbum(data)             // Create album
albumClient.updateAlbum(id, updates)      // Update album
albumClient.deleteAlbum(id)               // Delete album
albumClient.addPhotosToAlbum(id, photos)  // Add photos
albumClient.removePhotoFromAlbum(id, pid) // Remove photo
albumClient.reorderAlbumPhotos(id, order) // Reorder photos
```

## Testing

Tests are located in `__tests__` directories:
- Service tests: `services/__tests__/albumService.test.ts`
- Component tests: `components/*/tests__/*.test.tsx`

## Future Enhancements

- [ ] Bulk album operations
- [ ] Album templates
- [ ] Advanced filtering options
- [ ] Export/import functionality
- [ ] Album analytics
- [ ] Collaborative editing

## Contributing

When adding new features:
1. Follow the existing folder structure
2. Create custom hooks for complex logic
3. Use TypeScript for type safety
4. Add comprehensive error handling
5. Write tests for new functionality
6. Update this documentation