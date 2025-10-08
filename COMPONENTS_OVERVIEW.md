# DKL25 Admin Panel - Complete Component Overview

This document provides a comprehensive overview of all components in the DKL25 Admin Panel codebase.

## Table of Contents
- [Core Components](#core-components)
- [Layout Components](#layout-components)
- [UI Components](#ui-components)
- [Feature Components](#feature-components)
  - [Albums](#albums)
  - [Photos](#photos)
  - [Aanmeldingen (Registrations)](#aanmeldingen-registrations)
  - [Chat](#chat)
  - [Contact](#contact)
  - [Email](#email)
  - [Newsletter](#newsletter)
  - [Partners](#partners)
  - [Sponsors](#sponsors)
  - [Users & Permissions](#users--permissions)
  - [Videos](#videos)
  - [Under Construction](#under-construction)
  - [Dashboard](#dashboard)

---

## Core Components

### [`LoadingSkeleton`](src/components/LoadingSkeleton.tsx)
**Purpose:** Displays an animated loading placeholder
**Props:** None
**Usage:** Used throughout the app to show loading states

### Typography Components ([`typography.tsx`](src/components/typography.tsx))
Reusable text components with consistent styling:
- **`H1`** - Main page headings
- **`H2`** - Section headings
- **`H3`** - Subsection headings
- **`H4`** - Minor headings
- **`Text`** - Body text
- **`SmallText`** - Small body text
- **`ErrorText`** - Error messages (red)
- **`SuccessText`** - Success messages (green)
- **`Label`** - Form labels
- **`Caption`** - Small captions

---

## Layout Components

### Authentication

#### [`AuthGuard`](src/components/auth/AuthGuard.tsx)
**Purpose:** Protects routes by checking authentication status
**Props:** `children: ReactNode`
**Usage:** Wraps protected content, redirects to login if not authenticated

#### [`ProtectedRoute`](src/components/auth/ProtectedRoute.tsx)
**Purpose:** Route-level protection with permission checking
**Props:** 
- `children: ReactNode`
- `requiredPermission?: string`
**Usage:** Wraps routes that require specific permissions

### Main Layout

#### [`MainLayout`](src/components/layout/MainLayout.tsx)
**Purpose:** Main application layout wrapper
**Features:** 
- Responsive sidebar
- Header with navigation
- Content area

#### [`Header`](src/components/layout/Header.tsx)
**Purpose:** Top navigation bar
**Features:**
- Logo
- Search bar
- User menu
- Quick actions
- Mobile menu toggle

#### [`Sidebar`](src/components/layout/Sidebar/index.tsx)
**Purpose:** Main navigation sidebar
**Variants:**
- [`DesktopSidebar`](src/components/layout/Sidebar/DesktopSidebar.tsx) - Desktop view
- [`TabletSidebar`](src/components/layout/Sidebar/TabletSidebar.tsx) - Tablet view
- [`MobileSidebar`](src/components/layout/Sidebar/MobileSidebar.tsx) - Mobile drawer
- [`SidebarContent`](src/components/layout/Sidebar/SidebarContent.tsx) - Shared content

### Navigation Components

#### [`SearchBar`](src/components/layout/SearchBar.tsx)
**Purpose:** Global search functionality
**Features:**
- Searches across pages
- Keyboard shortcuts (Cmd/Ctrl + K)
- Grouped results by section
- Click-outside to close

#### [`UserMenu`](src/components/layout/UserMenu.tsx)
**Purpose:** User account dropdown menu
**Features:**
- Profile link
- Settings link
- Logout functionality
- User avatar display

#### [`QuickActions`](src/components/layout/QuickActions.tsx)
**Purpose:** Quick access menu for creating content
**Features:**
- Create sponsor
- Upload photo
- Create album
- Add partner
- Modal management for each action

#### [`FavoritePages`](src/components/layout/FavoritePages.tsx)
**Purpose:** Displays user's favorite pages
**Features:**
- Star/unstar pages
- Quick navigation

#### [`RecentPages`](src/components/layout/RecentPages.tsx)
**Purpose:** Shows recently visited pages
**Features:**
- Automatic tracking
- Quick navigation

---

## UI Components

### [`ConfirmDialog`](src/components/ui/ConfirmDialog.tsx)
**Purpose:** Confirmation modal for destructive actions
**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onConfirm: () => void | Promise<void>`
- `title: string`
- `message: string`
- `confirmText?: string`
- `cancelText?: string`
- `variant?: 'danger' | 'warning' | 'info'`
- `isProcessing?: boolean`

### [`EmptyState`](src/components/ui/EmptyState.tsx)
**Purpose:** Displays empty state with icon and message
**Props:**
- `icon?: ReactNode`
- `title: string`
- `description?: string`
- `action?: { label: string; onClick: () => void }`
- `className?: string`

### [`LoadingGrid`](src/components/ui/LoadingGrid.tsx)
**Purpose:** Grid of loading skeletons
**Props:**
- `count?: number` (default: 6)
- `columns?: number` (default: 3)
- `className?: string`

---

## Feature Components

## Albums

### Display Components

#### [`AlbumCard`](src/features/albums/components/display/AlbumCard.tsx)
**Purpose:** Individual album card with actions
**Props:**
- `album: Album`
- `onUpdate: () => void`
- `isSelected?: boolean`
- `onSelect?: (id: string) => void`
**Features:**
- Cover photo display
- Edit/delete actions
- Add photos
- Select cover photo
- Visibility toggle

#### [`AlbumGrid`](src/features/albums/components/display/AlbumGrid.tsx)
**Purpose:** Grid display of albums with drag-and-drop reordering
**Props:**
- `onAlbumSelect?: (albumId: string) => void`
- `selectedAlbumId?: string`
**Features:**
- Infinite scroll
- Drag-and-drop ordering
- Filter by visibility
- Admin-only features

### Detail Components

#### [`AlbumDetailModal`](src/features/albums/components/detail/AlbumDetailModal.tsx)
**Purpose:** Full album details modal
**Props:**
- `album: AlbumWithDetails`
- `onClose: () => void`
- `onSave: () => void`
**Features:**
- View all photos
- Edit album
- Add/remove photos
- Change cover photo
- Toggle visibility

#### [`AlbumDetailHeader`](src/features/albums/components/detail/AlbumDetailHeader.tsx)
**Purpose:** Album detail modal header
**Props:**
- `title: string`
- `description?: string`
- `isVisible: boolean`
- `onClose: () => void`
- `onVisibilityToggle: () => void`
- `loading?: boolean`

#### [`AlbumDetailInfo`](src/features/albums/components/detail/AlbumDetailInfo.tsx)
**Purpose:** Album information section
**Props:**
- `album: AlbumWithDetails`
- `photosCount: number`
- `onCoverPhotoSelect: () => void`

#### [`AlbumDetailActions`](src/features/albums/components/detail/AlbumDetailActions.tsx)
**Purpose:** Action buttons for album detail
**Props:**
- `onAddPhotos: () => void`
- `onEditAlbum: () => void`
- `loading?: boolean`

#### [`AlbumDetailPhotos`](src/features/albums/components/detail/AlbumDetailPhotos.tsx)
**Purpose:** Photos section in album detail
**Props:**
- `album: AlbumWithDetails`
- `photos: Photo[]`
- `photosCount: number`
- `loading: boolean`
- `onPhotoRemove: (photoId: string) => void`
- `removingPhotoId: string | null`

### Form Components

#### [`AlbumForm`](src/features/albums/components/forms/AlbumForm.tsx)
**Purpose:** Create/edit album form
**Props:**
- `album?: Album`
- `onComplete: () => void`
- `onCancel: () => void`
**Fields:**
- Title
- Description
- Visibility

#### [`PhotoSelector`](src/features/albums/components/forms/PhotoSelector.tsx)
**Purpose:** Select photos to add to album
**Props:**
- `albumId: string`
- `existingPhotoIds: string[]`
- `onComplete: (photoIds: string[]) => void`
- `onCancel: () => void`
**Features:**
- Grid view of available photos
- Multi-select
- Excludes already added photos

#### [`PhotoOrderer`](src/features/albums/components/forms/PhotoOrderer.tsx)
**Purpose:** Drag-and-drop photo ordering
**Props:**
- `album: AlbumWithDetails`
- `onOrderChange: () => void`
- `onPhotoRemove: (photoId: string) => void`
- `removingPhotoId: string | null`
**Features:**
- Drag-and-drop reordering
- Remove photos
- Visual feedback

#### [`SortablePhoto`](src/features/albums/components/forms/SortablePhoto.tsx)
**Purpose:** Individual draggable photo item
**Props:**
- `photo: Photo`
- `onRemove: (photoId: string) => void`
- `isRemoving: boolean`

#### [`CoverPhotoSelector`](src/features/albums/components/forms/CoverPhotoSelector.tsx)
**Purpose:** Select album cover photo
**Props:**
- `albumId: string`
- `currentCoverPhotoId: string | null`
- `onSelect: (photoId: string | null) => void`
**Features:**
- Grid of album photos
- Current cover highlighted
- Option to remove cover

### Preview Components

#### [`GalleryPreviewModal`](src/features/albums/components/preview/GalleryPreviewModal.tsx)
**Purpose:** Full gallery preview modal
**Props:**
- `open: boolean`
- `onClose: () => void`
**Features:**
- Album selection
- Photo slideshow
- Thumbnail navigation

#### [`PhotoGalleryPreview`](src/features/albums/components/preview/PhotoGalleryPreview.tsx)
**Purpose:** Main gallery preview component
**Props:**
- `galleryData: GalleryData[]`
- `initialAlbumId?: string`
**Features:**
- Album switching
- Image preloading
- Swipe gestures

#### [`MainSlider`](src/features/albums/components/preview/MainSlider.tsx)
**Purpose:** Main photo slider
**Props:**
- `photos: Photo[]`
- `currentIndex: number`
- `onIndexChange: (index: number) => void`
- `onImageClick: () => void`
**Features:**
- Keyboard navigation
- Touch gestures
- Navigation buttons

#### [`ThumbnailSlider`](src/features/albums/components/preview/ThumbnailSlider.tsx)
**Purpose:** Thumbnail navigation strip
**Props:**
- `photos: Photo[]`
- `currentIndex: number`
- `onThumbnailClick: (index: number) => void`
**Features:**
- Horizontal scroll
- Auto-scroll to active
- Drag scrolling

#### [`ImageModal`](src/features/albums/components/preview/ImageModal.tsx)
**Purpose:** Full-screen image viewer
**Props:**
- `isOpen: boolean`
- `imageUrl: string`
- `onClose: () => void`
- `onPrevious: () => void`
- `onNext: () => void`
- `hasPrevious: boolean`
- `hasNext: boolean`

#### [`NavigationButton`](src/features/albums/components/preview/NavigationButton.tsx)
**Purpose:** Previous/Next navigation button
**Props:**
- `direction: 'previous' | 'next'`
- `onClick: () => void`
- `disabled?: boolean`

### Utility Components

#### [`ErrorBoundary`](src/features/albums/components/ErrorBoundary.tsx)
**Purpose:** Catches and displays album-related errors
**Props:**
- `children: ReactNode`

---

## Photos

### Display Components

#### [`PhotoGrid`](src/features/photos/components/display/PhotoGrid.tsx)
**Purpose:** Grid view of photos
**Props:**
- `photos: Photo[]`
- `albums: Album[]`
- `onPhotoUpdate: () => void`
- `onPhotoDelete: (photoId: string) => void`
- `selectedPhotos: string[]`
- `onPhotoSelect: (photoId: string) => void`
- `onPhotoClick: (photo: Photo) => void`
**Features:**
- Multi-select
- Quick actions (edit, delete, visibility)
- Album badges
- Responsive grid

#### [`PhotoList`](src/features/photos/components/display/PhotoList.tsx)
**Purpose:** Table view of photos
**Props:** Same as PhotoGrid
**Features:**
- Sortable columns
- Compact view
- Album information
- Quick actions

#### [`PhotoDetailsModal`](src/features/photos/components/display/PhotoDetailsModal.tsx)
**Purpose:** Detailed photo view and editing
**Props:**
- `photo: Photo`
- `onClose: () => void`
- `onUpdate: () => void`
- `albums: Album[]`
- `allPhotos: Photo[]`
- `onNavigate: (photoId: string) => void`
**Features:**
- Full-size preview
- Edit metadata
- Album management
- Navigation between photos
- Keyboard shortcuts

### Form Components

#### [`PhotoForm`](src/features/photos/components/forms/PhotoForm.tsx)
**Purpose:** Create/edit single photo
**Props:**
- `photo?: Photo`
- `onComplete: () => void`
- `onCancel: () => void`
**Fields:**
- Title
- Description
- Year
- File upload (for new photos)

#### [`PhotoUploadModal`](src/features/photos/components/forms/PhotoUploadModal.tsx)
**Purpose:** Upload photos with album selection
**Props:**
- `open: boolean`
- `onClose: () => void`
- `onComplete: () => void`
- `albums: Album[]`
**Features:**
- Multi-file upload
- Album selection
- Drag-and-drop
- Progress indication

#### [`BulkUploadButton`](src/features/photos/components/forms/BulkUploadButton.tsx)
**Purpose:** Bulk photo upload with Cloudinary
**Props:**
- `onUploadComplete: () => void`
- `targetYear?: number`
- `className?: string`
- `maxFiles?: number`
- `maxFileSize?: number`
**Features:**
- Batch processing
- Progress tracking
- Drag-and-drop
- File validation

#### [`CloudinaryImportModal`](src/features/photos/components/forms/CloudinaryImportModal.tsx)
**Purpose:** Import photos from Cloudinary media library
**Props:**
- `open: boolean`
- `onClose: () => void`
- `onComplete: () => void`
- `targetYear?: number`
**Features:**
- Cloudinary widget integration
- Multi-select
- Automatic metadata extraction

### Layout Components

#### [`PhotosHeader`](src/features/photos/components/layout/PhotosHeader.tsx)
**Purpose:** Photos page header with actions
**Props:**
- `onOpenUpload: () => void`
- `onOpenCloudinaryImport: () => void`

#### [`PhotosFilters`](src/features/photos/components/layout/PhotosFilters.tsx)
**Purpose:** Filter and view controls
**Props:**
- `searchQuery: string`
- `onSearchChange: (query: string) => void`
- `view: 'grid' | 'list'`
- `onViewChange: (view: 'grid' | 'list') => void`
- `selectedYear: number | null`
- `onYearChange: (year: number | null) => void`
- `years: number[]`

#### [`PhotoActionsBar`](src/features/photos/components/layout/PhotoActionsBar.tsx)
**Purpose:** Bulk actions toolbar
**Props:**
- `selectedCount: number`
- `onClearSelection: () => void`
- `onBulkDelete: () => void`
- `onBulkVisibility: (visible: boolean) => void`
- `onBulkAddToAlbum: (albumId: string) => void`
- `albums: Album[]`

#### [`PhotosContent`](src/features/photos/components/layout/PhotosContent.tsx)
**Purpose:** Main photos content area with tabs
**Props:**
- `activeTab: 'all' | 'albums' | 'unorganized'`
- `view: 'grid' | 'list'`
- `photos: Photo[]`
- `albums: Album[]`
- `selectedPhotos: string[]`
- `onPhotoSelect: (photoId: string) => void`
- `onPhotoUpdate: () => void`
- `onPhotoDelete: (photoId: string) => void`

#### [`PhotosPagination`](src/features/photos/components/layout/PhotosPagination.tsx)
**Purpose:** Load more pagination
**Props:**
- `hasMore: boolean`
- `loadingMore: boolean`
- `onLoadMore: () => void`
- `loadedCount: number`

### Utility Components

#### [`PhotoErrorBoundary`](src/features/photos/components/PhotoErrorBoundary.tsx)
**Purpose:** Error boundary for photo components
**Props:**
- `children: ReactNode`
- `fallback?: ReactNode`

---

## Aanmeldingen (Registrations)

#### [`AanmeldingenTab`](src/features/aanmeldingen/components/AanmeldingenTab.tsx)
**Purpose:** Main registrations management view
**Features:**
- Statistics overview
- Filter by role and status
- Registration list
- Status updates

#### [`RegistrationItem`](src/features/aanmeldingen/components/RegistrationItem.tsx)
**Purpose:** Individual registration card
**Props:**
- `registration: Aanmelding`
- `onStatusUpdate: () => void`
- `canWrite?: boolean`
**Features:**
- Expandable details
- Status management
- Contact information
- Role and distance info

---

## Chat

#### [`ChatLayout`](src/features/chat/components/ChatLayout.tsx)
**Purpose:** Main chat layout wrapper
**Props:**
- `isOpen: boolean`
- `onClose: () => void`
**Features:**
- Responsive layout
- Sidebar + window layout

#### [`ChatSidebar`](src/features/chat/components/ChatSidebar.tsx)
**Purpose:** Chat channels and users sidebar
**Props:**
- `onClose: () => void`
**Features:**
- Channel list
- Public channels
- Online users
- Create channel

#### [`ChatWindow`](src/features/chat/components/ChatWindow.tsx)
**Purpose:** Main chat message window
**Props:**
- `onToggleSidebar: () => void`
- `onClose: () => void`
**Features:**
- Message list
- Send messages
- File uploads
- Edit/delete messages
- Typing indicators
- Context menu

#### [`MessageSearch`](src/features/chat/components/MessageSearch.tsx)
**Purpose:** Search messages across channels
**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onSelectMessage: (message: MessageSearchResult) => void`
**Features:**
- Full-text search
- Result highlighting
- Jump to message

---

## Contact

#### [`ContactTab`](src/features/contact/components/ContactTab.tsx)
**Purpose:** Contact messages management
**Features:**
- Filter by status
- Message list
- Send email replies
- Status updates

#### [`MessageItem`](src/features/contact/components/MessageItem.tsx)
**Purpose:** Individual contact message card
**Props:**
- `message: ContactMessage`
- `onStatusUpdate: () => void`
**Features:**
- Expandable details
- Status management
- Email reply
- Contact information

---

## Email

#### [`EmailInbox`](src/features/email/components/EmailInbox.tsx)
**Purpose:** Email inbox management
**Props:**
- `account?: 'info' | 'bestuur'`
**Features:**
- Account switching
- Email list
- Email detail view
- Pagination
- Fetch new emails
- Delete emails
- Compose new email

#### [`EmailItem`](src/features/email/components/EmailItem.tsx)
**Purpose:** Email list item
**Props:**
- `email: Email`
- `isSelected: boolean`
- `onClick: () => void`
- `formattedDate: string`

#### [`EmailDetail`](src/features/email/components/EmailDetail.tsx)
**Purpose:** Email detail view
**Props:**
- `email: Email`
**Features:**
- HTML content rendering
- Attachments
- Email metadata

#### [`EmailDialog`](src/components/email/EmailDialog.tsx)
**Purpose:** Compose/reply email modal
**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onSend: (data: EmailData) => Promise<void>`
- `recipient?: string`
- `subject?: string`
- `replyTo?: string`
- `loggedInUserEmail: string`
**Features:**
- Rich text editor
- Email templates
- Image insertion
- Preview mode
- Signature

---

## Newsletter

#### [`NewsletterList`](src/features/newsletter/components/NewsletterList.tsx)
**Purpose:** Newsletter management list
**Props:**
- `onEdit: (newsletter: Newsletter) => void`
- `onCreate: () => void`
**Features:**
- Newsletter list
- Send newsletter
- Edit/delete
- Status display

#### [`NewsletterEditor`](src/features/newsletter/components/NewsletterEditor.tsx)
**Purpose:** Rich newsletter editor
**Props:**
- `newsletter?: Newsletter`
- `onComplete: () => void`
- `onCancel: () => void`
**Features:**
- Rich text editor
- Templates
- Image insertion
- Subject line
- Preview

#### [`NewsletterForm`](src/features/newsletter/components/NewsletterForm.tsx)
**Purpose:** Simple newsletter form
**Props:**
- `newsletter?: Newsletter`
- `onComplete: () => void`
- `onCancel: () => void`

#### [`NewsletterHistory`](src/features/newsletter/components/NewsletterHistory.tsx)
**Purpose:** Sent newsletters history
**Features:**
- Sent newsletters list
- Send date
- Recipient count

---

## Partners

#### [`PartnerCard`](src/features/partners/components/PartnerCard.tsx)
**Purpose:** Partner display card
**Props:**
- `partner: Partner`
- `onUpdate: () => void`
**Features:**
- Logo display
- Edit/delete actions
- Tier badge
- Website link

#### [`PartnerForm`](src/features/partners/components/PartnerForm.tsx)
**Purpose:** Create/edit partner
**Props:**
- `partner?: Partner`
- `onComplete: () => void`
- `onCancel: () => void`
**Fields:**
- Name
- Description
- Website
- Logo upload
- Tier selection
- Visibility

---

## Sponsors

#### [`SponsorGrid`](src/features/sponsors/components/SponsorGrid.tsx)
**Purpose:** Sponsors management grid
**Features:**
- Sponsor cards
- Filter and sort
- Create/edit/delete
- Visibility toggle

#### [`SponsorCard`](src/features/sponsors/components/SponsorCard.tsx)
**Purpose:** Individual sponsor card
**Props:**
- `sponsor: Sponsor`
- `onEdit: () => void`
- `onDelete: () => void`
- `onVisibilityToggle: () => void`

#### [`SponsorForm`](src/features/sponsors/components/SponsorForm.tsx)
**Purpose:** Create/edit sponsor
**Props:**
- `onComplete: () => void`
- `onCancel: () => void`
- `initialData?: Sponsor`
**Fields:**
- Name
- Description
- Logo upload
- Website
- Visibility

---

## Users & Permissions

### User Management

#### [`UserForm`](src/features/users/components/UserForm.tsx)
**Purpose:** Create/edit user
**Props:**
- `initialValues?: User`
- `onSubmit: (values: any) => Promise<void>`
- `isSubmitting: boolean`
**Fields:**
- Email
- Full name
- Role selection
- Active status
- Email verified

### Role Management

#### [`RoleList`](src/features/users/components/RoleList.tsx)
**Purpose:** Roles management list
**Features:**
- Role cards
- Permission count
- Create/edit/delete
- Filter

#### [`RoleForm`](src/features/users/components/RoleForm.tsx)
**Purpose:** Create/edit role with permissions
**Props:**
- `initialValues?: Role`
- `onSubmit: (values: any) => Promise<void>`
- `onPermissionUpdate?: () => void`
- `isSubmitting: boolean`
**Fields:**
- Name
- Description
- Permission selection (grouped by resource)

### Permission Management

#### [`PermissionList`](src/features/users/components/PermissionList.tsx)
**Purpose:** Permissions management list
**Features:**
- Grouped by resource
- Create/edit/delete
- Filter

#### [`PermissionForm`](src/features/users/components/PermissionForm.tsx)
**Purpose:** Create/edit permission
**Props:**
- `initialValues?: Permission`
- `onSubmit: (values: any) => Promise<void>`
- `isSubmitting: boolean`
**Fields:**
- Name
- Resource
- Action
- Description
- System permission flag

---

## Videos

#### [`VideosOverview`](src/features/videos/components/VideosOverview.tsx)
**Purpose:** Video management page
**Features:**
- Video list with drag-and-drop ordering
- Create/edit/delete videos
- Visibility toggle
- Bulk delete
- YouTube/Vimeo embed support
- Filter and sort

---

## Under Construction

#### [`UnderConstructionForm`](src/features/under-construction/components/UnderConstructionForm.tsx)
**Purpose:** Manage under construction page settings
**Props:**
- `onSave: () => void`
**Fields:**
- Active status
- Title
- Message
- Background image
- Social links
- Contact email
- Newsletter signup

---

## Dashboard

#### [`OverviewTab`](src/features/dashboard/components/OverviewTab.tsx)
**Purpose:** Dashboard overview with statistics
**Features:**
- Registration statistics
- Role distribution
- Distance statistics
- Support type breakdown

---

## Gallery Components

#### [`PhotoViewer`](src/components/gallery/PhotoViewer.tsx)
**Purpose:** Full-screen photo viewer
**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `imageUrl: string`
- `title?: string`
- `onPrevious?: () => void`
- `onNext?: () => void`
- `hasPrevious?: boolean`
- `hasNext?: boolean`
- `zIndex?: number`
**Features:**
- Keyboard navigation
- Previous/next buttons
- Close button
- Responsive

---

## Component Organization

### By Feature
Components are organized by feature in the `src/features/` directory:
- Each feature has its own `components/` subdirectory
- Related components are grouped together
- Shared components are in `src/components/`

### By Type
Within features, components are often organized by type:
- `display/` - Display/presentation components
- `forms/` - Form components
- `layout/` - Layout components
- `detail/` - Detail view components
- `preview/` - Preview components

### Naming Conventions
- Components use PascalCase
- Files match component names
- Index files export multiple related components
- Props interfaces are defined in the same file

### Common Patterns
- Most forms have `onComplete` and `onCancel` props
- List components have `onUpdate` callbacks
- Modal components have `isOpen`/`open` and `onClose` props
- Loading states use `loading` or `isLoading` props
- Error states use `error` props

---

## Total Component Count

- **Core Components:** 12
- **Layout Components:** 15
- **UI Components:** 3
- **Album Components:** 20
- **Photo Components:** 15
- **Aanmeldingen Components:** 2
- **Chat Components:** 4
- **Contact Components:** 2
- **Email Components:** 4
- **Newsletter Components:** 4
- **Partner Components:** 2
- **Sponsor Components:** 3
- **User/Permission Components:** 6
- **Video Components:** 1
- **Under Construction Components:** 1
- **Dashboard Components:** 1
- **Gallery Components:** 1

**Total: 96 Components**

---

*Last updated: 2025-01-08*