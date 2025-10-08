# Folder Structure Refactoring Plan

## Current Issues

1. **Inconsistent feature organization**: Some features have complete structure (components/services/types), others are missing pieces
2. **Missing barrel exports**: Not all feature modules have proper index.ts files
3. **Scattered components**: Some UI components are in root components folder, others in features
4. **Missing API layer**: No dedicated API folder for backend communication
5. **Test files location**: Tests are scattered or missing proper organization
6. **Missing shared utilities**: Common utilities could be better organized

## Proposed Professional Structure

```
src/
├── api/                          # API layer (NEW)
│   ├── client/                   # API client configuration
│   │   ├── supabase.ts
│   │   └── cloudinary.ts
│   ├── endpoints/                # API endpoint definitions
│   │   ├── albums.ts
│   │   ├── photos.ts
│   │   ├── partners.ts
│   │   └── ...
│   └── types/                    # API-specific types
│       └── responses.ts
│
├── assets/                       # Static assets
│   ├── images/
│   │   └── DKLLogo.png
│   └── icons/                    # (NEW) Custom icons if needed
│
├── components/                   # Shared/Common components only
│   ├── auth/
│   │   ├── AuthGuard.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   ├── common/                   # (NEW) Common reusable components
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar/
│   │   │   ├── DesktopSidebar.tsx
│   │   │   ├── MobileSidebar.tsx
│   │   │   ├── TabletSidebar.tsx
│   │   │   ├── SidebarContent.tsx
│   │   │   └── index.ts
│   │   ├── MainLayout.tsx
│   │   ├── FavoritePages.tsx
│   │   ├── RecentPages.tsx
│   │   ├── QuickActions.tsx
│   │   └── index.ts
│   ├── ui/                       # Base UI components
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── DataTable/
│   │   ├── ConfirmDialog/
│   │   ├── EmptyState/
│   │   ├── LoadingGrid/
│   │   └── index.ts
│   └── typography/
│       ├── typography.tsx
│       └── index.ts
│
├── config/                       # (NEW) Configuration files
│   ├── constants.ts
│   ├── routes.ts
│   ├── navigation.ts
│   └── zIndex.ts
│
├── features/                     # Feature modules (domain-driven)
│   ├── aanmeldingen/
│   │   ├── components/
│   │   │   ├── AanmeldingenTab.tsx
│   │   │   ├── RegistrationItem.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW) Feature-specific hooks
│   │   │   └── useAanmeldingen.ts
│   │   ├── services/
│   │   │   └── aanmeldingenService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts              # Barrel export
│   │
│   ├── albums/
│   │   ├── components/
│   │   │   ├── detail/
│   │   │   │   ├── AlbumDetailActions.tsx
│   │   │   │   ├── AlbumDetailHeader.tsx
│   │   │   │   ├── AlbumDetailInfo.tsx
│   │   │   │   ├── AlbumDetailModal.tsx
│   │   │   │   ├── AlbumDetailPhotos.tsx
│   │   │   │   └── index.ts
│   │   │   ├── display/
│   │   │   │   ├── AlbumCard.tsx
│   │   │   │   ├── AlbumGrid.tsx
│   │   │   │   └── index.ts
│   │   │   ├── forms/
│   │   │   │   ├── AlbumForm.tsx
│   │   │   │   ├── CoverPhotoSelector.tsx
│   │   │   │   ├── PhotoOrderer.tsx
│   │   │   │   ├── PhotoSelector.tsx
│   │   │   │   ├── SortablePhoto.tsx
│   │   │   │   └── index.ts
│   │   │   ├── preview/
│   │   │   │   ├── GalleryPreviewModal.tsx
│   │   │   │   ├── ImageModal.tsx
│   │   │   │   ├── MainSlider.tsx
│   │   │   │   ├── NavigationButton.tsx
│   │   │   │   ├── PhotoGalleryPreview.tsx
│   │   │   │   ├── ThumbnailSlider.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── usePhotoGallery.ts
│   │   │   ├── useSwipe.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── albumService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── auth/                     # (MOVED from contexts)
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.ts
│   │   │   ├── AuthProvider.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatLayout.tsx
│   │   │   ├── ChatSidebar.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageSearch.tsx
│   │   │   └── index.ts
│   │   ├── contexts/
│   │   │   ├── ChatContext.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── chatService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── ChatOverview.tsx
│   │   └── index.ts
│   │
│   ├── contact/
│   │   ├── components/
│   │   │   ├── ContactTab.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW)
│   │   │   └── useMessages.ts
│   │   ├── services/
│   │   │   └── messageService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── OverviewTab.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW)
│   │   │   └── useDashboard.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── email/
│   │   ├── components/
│   │   │   ├── EmailDetail.tsx
│   │   │   ├── EmailDialog.tsx
│   │   │   ├── EmailInbox.tsx
│   │   │   ├── EmailItem.tsx
│   │   │   ├── InboxTab.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW)
│   │   │   └── useEmail.ts
│   │   ├── services/
│   │   │   └── adminEmailService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── newsletter/
│   │   ├── components/
│   │   │   ├── NewsletterEditor.tsx
│   │   │   ├── NewsletterForm.tsx
│   │   │   ├── NewsletterHistory.tsx
│   │   │   ├── NewsletterList.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW)
│   │   │   └── useNewsletter.ts
│   │   ├── services/
│   │   │   └── newsletterService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── partners/
│   │   ├── components/
│   │   │   ├── PartnerCard.tsx
│   │   │   ├── PartnerForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW)
│   │   │   └── usePartners.ts
│   │   ├── services/
│   │   │   └── partnerService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── PartnersOverview.tsx
│   │   └── index.ts
│   │
│   ├── photos/
│   │   ├── components/
│   │   │   ├── display/
│   │   │   │   ├── PhotoDetailsModal.tsx
│   │   │   │   ├── PhotoGrid.tsx
│   │   │   │   ├── PhotoList.tsx
│   │   │   │   └── index.ts
│   │   │   ├── forms/
│   │   │   │   ├── BulkUploadButton.tsx
│   │   │   │   ├── CloudinaryImportModal.tsx
│   │   │   │   ├── PhotoForm.tsx
│   │   │   │   ├── PhotoUploadModal.tsx
│   │   │   │   └── index.ts
│   │   │   ├── layout/
│   │   │   │   ├── PhotoActionsBar.tsx
│   │   │   │   ├── PhotosContent.tsx
│   │   │   │   ├── PhotosFilters.tsx
│   │   │   │   ├── PhotosHeader.tsx
│   │   │   │   ├── PhotosPagination.tsx
│   │   │   │   └── index.ts
│   │   │   ├── PhotoErrorBoundary.tsx
│   │   │   ├── PhotoViewer.tsx      # (MOVED from components/gallery)
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── usePhotoActions.ts
│   │   │   ├── usePhotos.ts
│   │   │   ├── usePhotoSelection.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── photoService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── PhotosOverview.tsx
│   │   └── index.ts
│   │
│   ├── sponsors/
│   │   ├── components/
│   │   │   ├── SponsorCard.tsx
│   │   │   ├── SponsorForm.tsx
│   │   │   ├── SponsorGrid.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW)
│   │   │   └── useSponsors.ts
│   │   ├── services/
│   │   │   └── sponsorService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── under-construction/
│   │   ├── components/
│   │   │   ├── UnderConstructionForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW)
│   │   │   └── useUnderConstruction.ts
│   │   ├── services/
│   │   │   └── underConstructionService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── users/
│   │   ├── components/
│   │   │   ├── PermissionForm.tsx
│   │   │   ├── PermissionList.tsx
│   │   │   ├── RoleForm.tsx
│   │   │   ├── RoleList.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # (NEW)
│   │   │   ├── usePermissions.ts  # (MOVED from hooks/)
│   │   │   ├── useUsers.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── permissionService.ts
│   │   │   ├── roleService.ts
│   │   │   ├── userService.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── videos/
│       ├── components/
│       │   ├── VideosOverview.tsx
│       │   └── index.ts
│       ├── hooks/                # (NEW)
│       │   └── useVideos.ts
│       ├── services/
│       │   └── videoService.ts
│       ├── types/
│       │   └── index.ts
│       └── index.ts
│
├── hooks/                        # Global/shared hooks only
│   ├── useAPI.ts
│   ├── useDebounce.ts
│   ├── useFilters.ts
│   ├── useForm.ts
│   ├── useImageUpload.ts
│   ├── useLocalStorage.ts
│   ├── usePageTitle.ts
│   ├── usePagination.ts
│   ├── useSorting.ts
│   ├── useTheme.ts
│   └── index.ts                  # (NEW) Barrel export
│
├── lib/                          # Third-party integrations & utilities
│   ├── cloudinary/
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── services/
│       ├── createCRUDService.ts
│       └── index.ts
│
├── pages/                        # Page components (route handlers)
│   ├── AccessDeniedPage.tsx
│   ├── AdminPermissionsPage.tsx
│   ├── AlbumManagementPage.tsx
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── NewsletterManagementPage.tsx
│   ├── NotFoundPage.tsx
│   ├── PartnerManagementPage.tsx
│   ├── PhotoManagementPage.tsx
│   ├── ProfilePage.tsx
│   ├── SettingsPage.tsx
│   ├── SponsorManagementPage.tsx
│   ├── UnderConstructionPage.tsx
│   ├── UserManagementPage.tsx
│   ├── VideoManagementPage.tsx
│   └── index.ts                  # (NEW) Barrel export
│
├── providers/                    # (NEW) Global context providers
│   ├── FavoritesProvider.tsx     # (MOVED from contexts)
│   ├── NavigationHistoryProvider.tsx  # (MOVED from contexts)
│   ├── SidebarProvider.tsx       # (MOVED from contexts)
│   ├── AppProviders.tsx          # (NEW) Combines all providers
│   └── index.ts
│
├── routes/                       # (NEW) Route configuration
│   ├── AppRoutes.tsx
│   ├── ProtectedRoutes.tsx
│   └── index.ts
│
├── styles/                       # Global styles
│   ├── scrollbars.css
│   ├── shared.ts
│   └── index.css                 # (RENAMED from index.css)
│
├── types/                        # Global TypeScript types
│   ├── base.ts
│   ├── cloudinary.d.ts
│   ├── dashboard.ts
│   ├── navigation.ts
│   ├── supabase.ts
│   └── index.ts
│
├── utils/                        # Utility functions
│   ├── apiErrorHandler.ts
│   ├── caseConverter.ts
│   ├── validation.ts
│   ├── formatters/               # (NEW) Formatting utilities
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   └── index.ts
│   └── index.ts                  # (NEW) Barrel export
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

## Key Improvements

### 1. **Feature-First Organization**
- Each feature is self-contained with its own components, hooks, services, and types
- Easier to understand feature boundaries
- Better code colocation

### 2. **Consistent Structure**
- Every feature follows the same pattern: components/ hooks/ services/ types/ index.ts
- Predictable file locations
- Easier onboarding for new developers

### 3. **Proper Separation of Concerns**
- `components/` - Only shared/reusable components
- `features/` - Domain-specific logic
- `lib/` - Third-party integrations
- `utils/` - Pure utility functions
- `config/` - Configuration and constants

### 4. **Better Imports with Barrel Exports**
- Each folder has an index.ts for clean imports
- Example: `import { AlbumCard, AlbumGrid } from '@/features/albums'`

### 5. **Clearer API Layer**
- Dedicated `api/` folder for backend communication
- Separation between API client and endpoints

### 6. **Context/Provider Organization**
- Global providers in `providers/` folder
- Feature-specific contexts stay within features
- Single `AppProviders.tsx` to combine all providers

### 7. **Route Configuration**
- Dedicated `routes/` folder for route definitions
- Cleaner App.tsx

## Migration Strategy

### Phase 1: Create New Structure (No Breaking Changes)
1. Create new folders: `api/`, `config/`, `providers/`, `routes/`
2. Add barrel exports (index.ts) to existing folders
3. Move constants to `config/`

### Phase 2: Reorganize Features
1. Move auth context to `features/auth/`
2. Move PhotoViewer to `features/photos/`
3. Add missing hooks folders to features
4. Move feature-specific hooks from global `hooks/` to features

### Phase 3: Reorganize Global Code
1. Move global contexts to `providers/`
2. Create `AppProviders.tsx`
3. Reorganize `lib/` structure
4. Add utility subfolders

### Phase 4: Update Imports
1. Update all import paths to use new structure
2. Use barrel exports for cleaner imports
3. Update tsconfig paths if needed

### Phase 5: Clean Up
1. Remove old empty folders
2. Update documentation
3. Verify all tests pass

## Benefits

1. **Scalability**: Easy to add new features without cluttering existing code
2. **Maintainability**: Clear boundaries make it easier to modify code
3. **Discoverability**: Predictable structure helps find code quickly
4. **Testability**: Feature isolation makes testing easier
5. **Team Collaboration**: Clear structure reduces merge conflicts
6. **Professional Standards**: Follows industry best practices

## Next Steps

1. Review and approve this plan
2. Create backup/branch
3. Execute migration in phases
4. Update documentation
5. Verify application functionality