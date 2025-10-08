# 📦 Components Reference

> **Versie:** 2.0 | **Status:** Complete | **Laatste Update:** 2025-01-08

Complete inventaris van alle componenten in het DKL25 Admin Panel.

---

## 📊 Overzicht

**Totaal:** 96 componenten

### Verdeling

| Categorie | Aantal | %  |
|-----------|--------|----|
| **Feature Components** | 66 | 69% |
| **Layout Components** | 15 | 16% |
| **Core Components** | 12 | 13% |
| **UI Components** | 3 | 3% |

---

## 🎨 UI Components

### ConfirmDialog
**Locatie:** [`src/components/ui/ConfirmDialog.tsx`](../../src/components/ui/ConfirmDialog.tsx)  
**Gebruik:** 14x in codebase  
**Doel:** Confirmation modal voor destructieve acties

### EmptyState
**Locatie:** [`src/components/ui/EmptyState.tsx`](../../src/components/ui/EmptyState.tsx)  
**Gebruik:** 12x in codebase  
**Doel:** Empty state met icon en message

### LoadingGrid
**Locatie:** [`src/components/ui/LoadingGrid.tsx`](../../src/components/ui/LoadingGrid.tsx)  
**Gebruik:** 17x in codebase  
**Doel:** Grid van loading skeletons

---

## 🏗️ Layout Components

### MainLayout
**Features:** Responsive sidebar, Header, Content area

### Header
**Features:** Logo, Search, User menu, Quick actions

### Sidebar
**Variants:** Desktop, Tablet, Mobile, Shared content

### Navigation
- SearchBar - Global search met keyboard shortcuts
- UserMenu - Profile, Settings, Logout
- QuickActions - Create actions
- FavoritePages - Star/unstar pages
- RecentPages - Automatic tracking

---

## 🎯 Feature Components

### Albums (20)
- Display: AlbumCard, AlbumGrid
- Detail: AlbumDetailModal, Header, Info, Actions, Photos
- Forms: AlbumForm, PhotoSelector, PhotoOrderer, CoverPhotoSelector
- Preview: GalleryPreviewModal, MainSlider, ThumbnailSlider, ImageModal

### Photos (15)
- Display: PhotoGrid, PhotoList, PhotoDetailsModal
- Forms: PhotoForm, PhotoUploadModal, BulkUploadButton
- Layout: PhotosHeader, PhotosFilters, PhotoActionsBar, PhotosContent

### Users & Permissions (6)
- UserForm, RoleList, RoleForm
- PermissionList, PermissionForm

### Other Features
- **Chat** (4) - ChatLayout, ChatSidebar, ChatWindow, MessageSearch
- **Email** (4) - EmailInbox, EmailItem, EmailDetail, EmailDialog
- **Newsletter** (4) - NewsletterList, NewsletterEditor, NewsletterForm
- **Partners** (2) - PartnerCard, PartnerForm
- **Sponsors** (3) - SponsorGrid, SponsorCard, SponsorForm
- **Contact** (2) - ContactTab, MessageItem
- **Aanmeldingen** (2) - AanmeldingenTab, RegistrationItem
- **Dashboard** (1) - OverviewTab
- **Videos** (1) - VideosOverview

---

## 📁 Organisatie

### By Feature
- Componenten per feature in `src/features/`
- Shared componenten in `src/components/`

### By Type
- `display/` - Presentation componenten
- `forms/` - Form componenten
- `layout/` - Layout componenten
- `detail/` - Detail views
- `preview/` - Preview componenten

### Naming Conventions
- **PascalCase** voor componenten
- **Files** matchen component namen
- **Index files** voor barrel exports
- **Props interfaces** in hetzelfde bestand

---

## 🎯 Common Patterns

### Forms
```typescript
interface FormProps {
  initialValues?: Entity
  onComplete: () => void
  onCancel: () => void
}
```

### Lists
```typescript
interface ListProps {
  items: Entity[]
  onUpdate: () => void
  loading?: boolean
}
```

### Modals
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
}
```

---

**Versie:** 2.0  
**Laatste Update:** 2025-01-08  
**Total Components:** 96