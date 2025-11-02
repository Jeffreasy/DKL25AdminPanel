# 📁 DKL25 Admin Panel - Project Structure & Organization

> **Version:** 1.0 | **Last Updated:** 2025-11-02  
> **Comprehensive documentation on folder structure and code organization**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Root Level Structure](#root-level-structure)
- [Source Code Organization](#source-code-organization)
- [Feature Modules](#feature-modules)
- [Shared Components](#shared-components)
- [API Layer](#api-layer)
- [Testing Structure](#testing-structure)
- [Documentation Structure](#documentation-structure)
- [Configuration Files](#configuration-files)
- [Best Practices](#best-practices)
- [Structural Issues & Recommendations](#structural-issues--recommendations)

---

## Overview

DKL25 Admin Panel is een modern React + TypeScript applicatie gebouwd volgens een **feature-based architectuur** met duidelijke scheiding van concerns. Het project volgt industry best practices voor schaalbaarheid, onderhoudbaarheid en testbaarheid.

### Technology Stack
- **Framework**: React 18 + TypeScript 5.6
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS 3.4
- **State Management**: Context API + React Query
- **Testing**: Vitest + React Testing Library + Playwright
- **Backend**: Go Fiber REST API + PostgreSQL + Redis

---

## Root Level Structure

```
DKL25AdminPanel/
├── docs/                    # Project documentation
├── e2e/                     # End-to-end tests (Playwright)
├── public/                  # Static assets
├── src/                     # Source code
├── .env.example            # Environment variables template
├── .eslintrc.test.json     # ESLint test configuration
├── .gitignore              # Git ignore rules
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── playwright.config.ts    # Playwright configuration
├── postcss.config.js       # PostCSS configuration
├── README.md               # Main project documentation
├── tailwind.config.cjs     # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## Source Code Organization

### Main Directories

```
src/
├── api/                    # API client layer
│   ├── client/            # Individual API clients
│   └── types/             # API type definitions
├── components/            # Shared React components
│   ├── auth/             # Authentication components
│   ├── common/           # Common reusable components
│   ├── layout/           # Layout components
│   ├── typography/       # Typography components
│   └── ui/               # UI primitives
├── features/             # Feature modules (business logic)
│   ├── aanmeldingen/    # Registration management
│   ├── albums/          # Album management
│   ├── auth/            # Authentication
│   ├── chat/            # Chat system
│   ├── contact/         # Contact messages
│   ├── dashboard/       # Dashboard
│   ├── email/           # Email management
│   ├── navigation/      # Navigation utilities
│   ├── newsletter/      # Newsletter management
│   ├── partners/        # Partner management
│   ├── photos/          # Photo management
│   ├── sponsors/        # Sponsor management
│   ├── steps/           # Steps management
│   ├── under-construction/ # Under construction pages
│   ├── users/           # User management (RBAC)
│   └── videos/          # Video management
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   └── services/       # Service utilities
├── pages/              # Page components (routing)
├── providers/          # React context providers
├── styles/             # Global styles
├── test/               # Test utilities & setup
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
├── index.css           # Global CSS
├── main.tsx            # Application entry point
└── vite-env.d.ts       # Vite type definitions
```

---

## Feature Modules

### Feature Module Pattern

Elk feature volgt een **consistent pattern** (waar van toepassing):

```
feature/
├── index.ts              # Public exports
├── types.ts              # Feature-specific types
├── README.md             # Feature documentation
├── components/           # Feature components
│   ├── [ComponentName].tsx
│   └── __tests__/       # Component tests
├── hooks/               # Feature hooks
│   ├── use[HookName].ts
│   └── __tests__/       # Hook tests
├── services/            # Business logic & API
│   ├── [service].ts
│   └── __tests__/       # Service tests
├── contexts/            # Feature contexts (optional)
└── utils/               # Feature utilities (optional)
```

### Feature Modules Overview

#### 1. **Albums** (Most Complete)
```
albums/
├── AlbumsOverview.tsx          # Main overview component
├── index.ts
├── README.md
├── types.ts
├── components/
│   ├── ErrorBoundary.tsx
│   ├── detail/                 # Album detail views
│   │   ├── AlbumDetailActions.tsx
│   │   ├── AlbumDetailHeader.tsx
│   │   ├── AlbumDetailInfo.tsx
│   │   ├── AlbumDetailModal.tsx
│   │   └── AlbumDetailPhotos.tsx
│   ├── display/                # Display components
│   │   ├── AlbumCard.tsx
│   │   ├── AlbumGrid.tsx
│   │   └── __tests__/
│   ├── forms/                  # Form components
│   │   ├── AlbumForm.tsx
│   │   ├── CoverPhotoSelector.tsx
│   │   ├── PhotoOrderer.tsx
│   │   ├── PhotoSelector.tsx
│   │   ├── SortablePhoto.tsx
│   │   └── __tests__/
│   └── preview/                # Gallery preview
│       ├── GalleryPreviewModal.tsx
│       ├── ImageModal.tsx
│       ├── MainSlider.tsx
│       ├── NavigationButton.tsx
│       ├── PhotoGalleryPreview.tsx
│       ├── ThumbnailSlider.tsx
│       └── hooks/
├── hooks/
│   ├── useAlbumData.ts
│   ├── useAlbumMutations.ts
│   └── usePhotoSelection.ts
└── services/
    ├── albumService.ts
    └── __tests__/
```
**Status**: ✅ Complete - Uitgebreide structuur met sub-categorieën

#### 2. **Auth** (Core Feature)
```
auth/
├── index.ts
├── contexts/
│   ├── AuthContext.ts          # Auth context definition
│   ├── AuthProvider.tsx        # Auth provider component
│   └── __tests__/
└── hooks/
    ├── useAuth.ts              # Main auth hook
    └── __tests__/
```
**Status**: ✅ Complete - Minimaal maar compleet voor auth

#### 3. **Users** (RBAC Management)
```
users/
├── types.ts
├── components/
│   ├── BulkRoleOperations.tsx
│   ├── PermissionForm.tsx
│   ├── PermissionList.tsx
│   ├── RoleForm.tsx
│   ├── RoleList.tsx
│   ├── UserForm.tsx
│   └── UserRoleAssignmentModal.tsx
└── services/
    ├── userService.ts
    └── __tests__/
```
**Status**: ⚠️ Incomplete - Mist hooks/, contexts/, en components organisatie

#### 4. **Videos** (Well Structured)
```
videos/
├── index.ts
├── README.md
├── types.ts
├── hooks/
│   ├── useVideoDragDrop.ts
│   ├── useVideoForm.ts
│   ├── useVideos.ts
│   ├── useVideoSelection.ts
│   └── __tests__/
├── services/
│   ├── videoService.ts
│   └── __tests__/
└── utils/
    ├── videoUrlUtils.ts
    └── __tests__/
```
**Status**: ✅ Complete - Goede structuur met hooks en utils

#### 5. **Photos** (Basic)
```
photos/
├── PhotosOverview.tsx
├── types.ts
├── hooks.ts
└── services/
    └── photoService.ts
```
**Status**: ⚠️ Minimal - Weinig structuur, alles in root

#### 6. **Contact** (Basic)
```
contact/
├── types.ts
└── services/
    ├── messageService.ts
    └── __tests__/
```
**Status**: ⚠️ Minimal - Alleen services, mist components

#### 7. **Aanmeldingen, Chat, Dashboard, Email, Navigation, Newsletter, Partners, Sponsors, Steps, Under-Construction**
**Status**: ⚠️ Incomplete - Geen zichtbare structuur in huidige listing

---

## Shared Components

### Component Categories

#### 1. **Auth Components** (`components/auth/`)
```
auth/
├── AuthGuard.tsx              # Route protection HOC
├── ProtectedRoute.tsx         # Protected route wrapper
├── index.ts
└── __tests__/
    ├── AuthGuard.test.tsx
    └── ProtectedRoute.test.tsx
```
**Purpose**: Authenticatie en autorisatie guards voor routes

#### 2. **Common Components** (`components/common/`)
```
common/
├── LoadingSkeleton.tsx        # Loading states
└── index.ts
```
**Purpose**: Algemeen herbruikbare components

#### 3. **Layout Components** (`components/layout/`)
```
layout/
├── UserMenu.tsx               # User menu in header
└── __tests__/
    ├── FavoritePages.test.tsx
    ├── Header.test.tsx
    ├── MainLayout.test.tsx
    ├── QuickActions.test.tsx
    ├── RecentPages.test.tsx
    ├── SearchBar.test.tsx
    └── UserMenu.test.tsx
```
**Purpose**: Layout structuur en navigatie components

#### 4. **Typography Components** (`components/typography/`)
```
typography/
├── typography.tsx             # Typography system
└── index.ts
```
**Purpose**: Consistente typografie

#### 5. **UI Components** (`components/ui/`)
```
ui/
├── ConfirmDialog.tsx          # Confirmation dialogs
├── DataTable.tsx              # Data table component
├── EmptyState.tsx             # Empty state displays
├── LoadingGrid.tsx            # Loading grid skeleton
├── Modal.tsx                  # Modal dialogs
├── index.ts
└── __tests__/
    ├── ConfirmDialog.test.tsx
    ├── DataTable.test.tsx
    ├── EmptyState.test.tsx
    ├── LoadingGrid.test.tsx
    └── Modal.test.tsx
```
**Purpose**: Herbruikbare UI primitives

---

## API Layer

### API Structure

```
api/
├── client/                    # API clients
│   ├── albumClient.ts        # Album API
│   ├── auth.ts               # Auth API
│   ├── cloudinary.ts         # Cloudinary integration
│   ├── contactClient.ts      # Contact API
│   ├── imageUploadClient.ts  # Image upload
│   ├── index.ts              # Client exports
│   ├── partnerClient.ts      # Partner API
│   ├── photos.ts             # Photos API
│   ├── rbacClient.ts         # RBAC API
│   ├── sponsorClient.ts      # Sponsor API
│   ├── stepsClient.ts        # Steps API
│   ├── supabase.ts           # Supabase client
│   ├── underConstructionClient.ts
│   └── videoClient.ts        # Video API
└── types/
    ├── cloudinary.ts         # Cloudinary types
    └── index.ts
```

### API Client Pattern

Alle API clients volgen een consistent pattern:
```typescript
// Example: albumClient.ts
export const albumClient = {
  getAll: () => axios.get('/albums'),
  getById: (id: string) => axios.get(`/albums/${id}`),
  create: (data: AlbumData) => axios.post('/albums', data),
  update: (id: string, data: AlbumData) => axios.put(`/albums/${id}`, data),
  delete: (id: string) => axios.delete(`/albums/${id}`)
}
```

---

## Testing Structure

### Test Organization

```
src/
├── [feature]/
│   └── __tests__/            # Feature tests
├── test/                     # Test utilities
│   ├── setup.ts             # Test setup
│   ├── utils.tsx            # Test utilities
│   ├── vitest.d.ts          # Vitest types
│   └── mocks/
│       ├── handlers.ts      # MSW handlers
│       └── server.ts        # MSW server
└── e2e/                      # E2E tests (root level)
    ├── auth/
    │   └── login.spec.ts
    ├── content/
    │   └── navigation.spec.ts
    └── management/
        └── permissions.spec.ts
```

### Test Coverage (Current: 80-85%)

| Category | Coverage | Status |
|----------|----------|--------|
| Components | ~85% | ✅ Excellent |
| Hooks | ~80% | ✅ Good |
| Services | ~75% | ✅ Good |
| Utils | ~90% | ✅ Excellent |
| E2E | Basic | ⚠️ Needs expansion |

---

## Documentation Structure

```
docs/
├── README.md                          # Documentation hub
├── BACKEND_API_REQUIREMENTS.md       # Backend API specs
├── architecture/                      # Architecture docs
│   ├── Auth_system.md                # Auth deep-dive
│   ├── components.md                 # Component architecture
│   ├── frontend-rbac-implementation.md
│   ├── layout-rbac-integration.md
│   └── RBAC_FRONTEND.md              # RBAC guide
├── features/                          # Feature documentation
│   ├── ALBUMS_REFACTORING_SUMMARY.md
│   └── STEPS_IMPLEMENTATION_STATUS.md
├── guides/                            # Development guides
│   ├── api-integration.md
│   ├── contributing.md
│   ├── deployment.md
│   ├── refactoring.md
│   ├── state-management.md
│   ├── styling.md
│   └── testing.md
├── refactoring/
│   └── MEDIA_UNIFICATION_REFACTORING.md
├── reports/                           # Project reports
│   ├── 90_PERCENT_COVERAGE_ACHIEVED.md
│   ├── features-audit.md
│   ├── FINAL_SESSION_REPORT_611_TESTS.md
│   └── TESTING_MILESTONE_ACHIEVED.md
└── testing/                           # Testing docs
    ├── README.md                      # Testing hub
    ├── MIGRATION_GUIDE.md
    ├── guides/
    │   ├── coverage-roadmap.md
    │   ├── current-status.md
    │   ├── getting-started.md
    │   ├── installation-guide.md
    │   ├── testing-strategy.md
    │   └── troubleshooting.md
    └── reports/
        ├── coverage-analysis.md
        ├── implementation-report.md
        ├── milestone-achievements.md
        └── status-update.md
```

**Documentation Status**: ✅ Zeer uitgebreid en goed georganiseerd

---

## Configuration Files

### Build & Development

| File | Purpose | Status |
|------|---------|--------|
| `vite.config.ts` | Vite configuration | ✅ |
| `tsconfig.json` | TypeScript configuration | ✅ |
| `tailwind.config.cjs` | Tailwind CSS configuration | ✅ |
| `postcss.config.js` | PostCSS configuration | ✅ |
| `eslint.config.js` | ESLint configuration | ✅ |
| `.eslintrc.test.json` | ESLint test config | ✅ |

### Testing

| File | Purpose | Status |
|------|---------|--------|
| `playwright.config.ts` | Playwright E2E config | ✅ |
| `vitest.config.ts` | Vitest config (in vite.config) | ✅ |

### Environment

| File | Purpose | Status |
|------|---------|--------|
| `.env.example` | Environment template | ✅ |
| `.env` | Local environment (gitignored) | ✅ |

---

## Best Practices

### ✅ Current Strengths

1. **Feature-Based Architecture**
   - Duidelijke scheiding per feature
   - Encapsulatie van feature logic
   - Herbruikbare patterns

2. **Type Safety**
   - Volledige TypeScript coverage
   - Type definitions per feature
   - Strikte type checking

3. **Testing**
   - 80-85% code coverage
   - Unit + Integration + E2E tests
   - Test co-location met code

4. **Documentation**
   - Uitgebreide documentatie
   - Architecture guides
   - Testing guides

5. **Code Organization**
   - Consistent naming
   - Clear folder structure
   - Logical grouping

---

## Structural Issues & Recommendations

### 🔴 Critical Issues

1. **Inconsistent Feature Structure**
   - **Problem**: Sommige features (albums, videos) hebben uitgebreide structuur, anderen (photos, contact) zijn minimaal
   - **Impact**: Moeilijker te onderhouden, verwarring voor developers
   - **Recommendation**: Standaardiseer alle features naar dezelfde structuur

2. **Missing Feature Components**
   - **Problem**: Veel features hebben geen components/ folder
   - **Impact**: Components waarschijnlijk in pages/ of elders
   - **Recommendation**: Verplaats feature-specifieke components naar feature/components/

3. **Incomplete Feature Modules**
   - **Problem**: Features zoals aanmeldingen, chat, dashboard, email hebben geen zichtbare structuur
   - **Impact**: Onduidelijk waar code zich bevindt
   - **Recommendation**: Audit en reorganiseer deze features

### ⚠️ Medium Priority Issues

4. **Users Feature Organization**
   - **Problem**: Mist hooks/, alleen components als flat list
   - **Impact**: Moeilijk schaalbaar
   - **Recommendation**: 
     ```
     users/
     ├── components/
     │   ├── forms/
     │   │   ├── UserForm.tsx
     │   │   ├── RoleForm.tsx
     │   │   └── PermissionForm.tsx
     │   ├── lists/
     │   │   ├── RoleList.tsx
     │   │   └── PermissionList.tsx
     │   └── modals/
     │       ├── UserRoleAssignmentModal.tsx
     │       └── BulkRoleOperations.tsx
     ├── hooks/
     │   ├── useUsers.ts
     │   ├── useRoles.ts
     │   └── usePermissions.ts
     └── services/
     ```

5. **Photos Feature Structure**
   - **Problem**: Alles in root, geen components/ of hooks/ folder
   - **Impact**: Niet schaalbaar
   - **Recommendation**: Herstructureer naar standaard pattern

6. **Contact Feature Incompleteness**
   - **Problem**: Alleen services, geen components
   - **Impact**: Components waarschijnlijk elders
   - **Recommendation**: Verplaats alle contact-gerelateerde components naar feature

### 💡 Enhancement Opportunities

7. **API Client Organization**
   - **Current**: Alle clients in src/api/client/
   - **Suggestion**: Overweeg per-feature API clients
   ```
   features/albums/
   └── api/
       └── albumsApi.ts
   ```
   **Pro**: Volledige feature encapsulatie
   **Con**: Meer duplication voor shared API utilities

8. **Test Co-location Inconsistency**
   - **Problem**: Sommige __tests__ folders, sommige niet
   - **Recommendation**: Consistent __tests__ folders overal

9. **Missing Feature READMEs**
   - **Problem**: Alleen albums en videos hebben README.md
   - **Recommendation**: Voeg README.md toe aan elke feature

10. **Documentation Gaps**
    - Missing: Detailed component documentation
    - Missing: Hook documentation
    - Missing: Service layer documentation

---

## Recommended Standardization

### Standard Feature Template

```
feature-name/
├── index.ts                    # Public exports
├── README.md                   # Feature documentation
├── types.ts                    # Feature types
├── [FeatureName]Overview.tsx  # Main overview component (optional)
├── components/                 # Feature components
│   ├── forms/                 # Form components
│   │   ├── [Name]Form.tsx
│   │   └── __tests__/
│   ├── lists/                 # List/Grid components
│   │   ├── [Name]List.tsx
│   │   ├── [Name]Grid.tsx
│   │   └── __tests__/
│   ├── modals/                # Modal components
│   │   ├── [Name]Modal.tsx
│   │   └── __tests__/
│   └── [specialized]/         # Other categories
├── hooks/                     # Feature hooks
│   ├── use[FeatureName].ts
│   ├── use[FeatureName]Mutations.ts
│   └── __tests__/
├── services/                  # Business logic
│   ├── [feature]Service.ts
│   └── __tests__/
├── contexts/                  # Feature contexts (if needed)
│   ├── [Feature]Context.ts
│   ├── [Feature]Provider.tsx
│   └── __tests__/
└── utils/                     # Feature utilities (if needed)
    ├── [utility].ts
    └── __tests__/
```

### Migration Priority

**Phase 1: Critical (High Impact)**
1. Standaardiseer users feature
2. Reorganiseer photos feature
3. Completeer contact feature
4. Audit missing features (aanmeldingen, chat, etc.)

**Phase 2: Enhancement (Medium Impact)**
5. Add READMEs to all features
6. Consistent test co-location
7. Component categorization

**Phase 3: Optimization (Low Impact)**
8. Consider per-feature API clients
9. Enhanced documentation
10. Performance audits

---

## Conclusion

### Overall Assessment

| Aspect | Rating | Comments |
|--------|--------|----------|
| **Architecture** | ⭐⭐⭐⭐☆ | Solid feature-based design, needs consistency |
| **Code Organization** | ⭐⭐⭐☆☆ | Good structure, but inconsistent across features |
| **Documentation** | ⭐⭐⭐⭐⭐ | Excellent comprehensive docs |
| **Testing** | ⭐⭐⭐⭐☆ | Great coverage, well organized |
| **Type Safety** | ⭐⭐⭐⭐⭐ | Full TypeScript, excellent |
| **Scalability** | ⭐⭐⭐☆☆ | Can improve with standardization |

### Key Takeaways

✅ **Strengths**
- Excellent documentation
- High test coverage
- Strong TypeScript usage
- Feature-based architecture
- Good separation of concerns

⚠️ **Areas for Improvement**
- Inconsistent feature structure
- Missing components in some features
- Need standardization across all features
- Some features need reorganization

🎯 **Priority Actions**
1. Create standard feature template
2. Migrate users/photos/contact to standard structure
3. Audit and complete missing features
4. Add READMEs to all features
5. Ensure consistent test co-location

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-02  
**Maintained By**: Development Team  
**Next Review**: 2025-12-01