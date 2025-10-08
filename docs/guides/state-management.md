# 🔄 State Management Guide

> **Versie:** 1.0 | **Status:** Complete | **Laatste Update:** 2025-01-08

Complete guide voor state management patterns in het DKL25 Admin Panel.

---

## 📋 Inhoudsopgave

- [Overzicht](#-overzicht)
- [Server State (React Query)](#-server-state-react-query)
- [Client State (Context API)](#-client-state-context-api)
- [Local State (useState)](#-local-state-usestate)
- [Persistent State](#-persistent-state)
- [Best Practices](#-best-practices)

---

## 🎯 Overzicht

Het project gebruikt een hybride state management strategie:

| Type | Technologie | Gebruik |
|------|-------------|---------|
| **Server State** | React Query | API data, caching |
| **Global Client State** | Context API | Auth, sidebar, navigation |
| **Local State** | useState | Component-specific state |
| **Persistent State** | localStorage | User preferences, tokens |

---

## 🌐 Server State (React Query)

### Setup

**Locatie:** [`src/providers/AppProviders.tsx`](../../src/providers/AppProviders.tsx)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000,  // 10 minutes
      refetchOnWindowFocus: false
    }
  }
})

<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>
```

### useAPI Hook

**Locatie:** [`src/hooks/useAPI.ts`](../../src/hooks/useAPI.ts)

```typescript
import { useAPI } from '@/hooks/useAPI'

function PhotoList() {
  const { 
    data: photos, 
    loading, 
    error, 
    refetch 
  } = useAPI({
    queryKey: ['photos'],
    queryFn: () => photoService.getPhotos()
  })

  if (loading) return <LoadingGrid />
  if (error) return <ErrorState error={error} />
  
  return <PhotoGrid photos={photos} />
}
```

### Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function PhotoForm() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: (data) => photoService.createPhoto(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      toast.success('Photo created!')
    }
  })

  const handleSubmit = (data) => {
    mutation.mutate(data)
  }
}
```

---

## 🎨 Client State (Context API)

### Global Contexts

#### AuthContext
**Locatie:** [`src/features/auth/contexts/AuthProvider.tsx`](../../src/features/auth/contexts/AuthProvider.tsx)

```typescript
import { useAuth } from '@/features/auth'

const { user, isAuthenticated, login, logout } = useAuth()
```

**State:**
- User object met permissions
- Authentication status
- Loading states

#### SidebarContext
**Locatie:** [`src/providers/SidebarProvider.tsx`](../../src/providers/SidebarProvider.tsx)

```typescript
import { useSidebar } from '@/providers/SidebarProvider'

const { isOpen, toggle, close } = useSidebar()
```

**State:**
- Sidebar open/closed
- Mobile/desktop state

#### NavigationHistoryContext
**Locatie:** [`src/features/navigation/contexts/NavigationHistoryProvider.tsx`](../../src/features/navigation/contexts/NavigationHistoryProvider.tsx)

```typescript
import { useNavigationHistory } from '@/features/navigation'

const { history, addToHistory, clearHistory } = useNavigationHistory()
```

**State:**
- Recent pages
- Navigation history

#### FavoritesContext
**Locatie:** [`src/providers/FavoritesProvider.tsx`](../../src/providers/FavoritesProvider.tsx)

```typescript
import { useFavorites } from '@/providers/FavoritesProvider'

const { favorites, toggleFavorite, isFavorite } = useFavorites()
```

**State:**
- Favorite pages
- Toggle functionality

---

## 📦 Local State (useState)

### Component State

```typescript
function PhotoGrid() {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const handleSelect = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }
}
```

### Form State

```typescript
import { useForm } from '@/hooks/useForm'

const form = useForm<FormData>({
  initialValues: { name: '', email: '' },
  validate: (values) => {
    const errors = {}
    if (!values.name) errors.name = 'Required'
    return errors
  },
  onSubmit: async (values) => {
    await api.create(values)
  }
})
```

---

## 💾 Persistent State

### useLocalStorage Hook

**Locatie:** [`src/hooks/useLocalStorage.ts`](../../src/hooks/useLocalStorage.ts)

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage'

function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [language, setLanguage] = useLocalStorage('language', 'nl')
  
  return (
    <div>
      <button onClick={() => setTheme('dark')}>
        Dark Mode
      </button>
    </div>
  )
}
```

### Token Storage

```typescript
// In AuthProvider
localStorage.setItem('jwtToken', token)
localStorage.setItem('refreshToken', refreshToken)
localStorage.setItem('userId', userId)

// Retrieve
const token = localStorage.getItem('jwtToken')
```

---

## 🎯 Best Practices

### 1. Server State voor API Data

✅ **GOED:**
```typescript
const { data } = useAPI({
  queryKey: ['photos'],
  queryFn: () => photoService.getPhotos()
})
```

❌ **VERMIJD:**
```typescript
const [photos, setPhotos] = useState([])
useEffect(() => {
  photoService.getPhotos().then(setPhotos)
}, [])
```

### 2. Context voor Global State

✅ **GOED:**
```typescript
// In provider
<AuthProvider>
  <App />
</AuthProvider>

// In component
const { user } = useAuth()
```

❌ **VERMIJD:**
```typescript
// Prop drilling door meerdere levels
<Component user={user} />
```

### 3. Local State voor UI

✅ **GOED:**
```typescript
const [isOpen, setIsOpen] = useState(false)
const [selectedId, setSelectedId] = useState<string | null>(null)
```

### 4. Persistent State voor Preferences

✅ **GOED:**
```typescript
const [theme, setTheme] = useLocalStorage('theme', 'light')
```

---

## 🔄 State Update Patterns

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updatePhoto,
  onMutate: async (newPhoto) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['photos'] })
    
    // Snapshot previous value
    const previousPhotos = queryClient.getQueryData(['photos'])
    
    // Optimistically update
    queryClient.setQueryData(['photos'], old => 
      old.map(p => p.id === newPhoto.id ? newPhoto : p)
    )
    
    return { previousPhotos }
  },
  onError: (err, newPhoto, context) => {
    // Rollback on error
    queryClient.setQueryData(['photos'], context.previousPhotos)
  }
})
```

### Batch Updates

```typescript
const handleBulkDelete = async (ids: string[]) => {
  await Promise.all(
    ids.map(id => photoService.deletePhoto(id))
  )
  queryClient.invalidateQueries({ queryKey: ['photos'] })
}
```

---

## 📚 Referenties

### Providers
- [`src/providers/AppProviders.tsx`](../../src/providers/AppProviders.tsx)
- [`src/features/auth/contexts/AuthProvider.tsx`](../../src/features/auth/contexts/AuthProvider.tsx)
- [`src/providers/SidebarProvider.tsx`](../../src/providers/SidebarProvider.tsx)
- [`src/providers/FavoritesProvider.tsx`](../../src/providers/FavoritesProvider.tsx)

### Hooks
- [`src/hooks/useAPI.ts`](../../src/hooks/useAPI.ts)
- [`src/hooks/useLocalStorage.ts`](../../src/hooks/useLocalStorage.ts)
- [`src/hooks/useForm.ts`](../../src/hooks/useForm.ts)

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Status:** Complete