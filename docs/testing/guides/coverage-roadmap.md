# 🚀 Accelerated 100% Coverage & E2E Testing Plan

> **Versie:** 1.0 | **Status:** Active | **Laatste Update:** 2025-01-08

Plan om snel naar 100% test coverage en E2E testing te gaan.

---

## 🎯 Current Status

```
✅ Test Files: 12 passed
✅ Tests: 162 passed
✅ Pass Rate: 100%
✅ Current Coverage: ~35% (focused)
```

### What's Tested (100% passing)
- ✅ UI Components: ConfirmDialog, EmptyState, LoadingGrid, Modal, DataTable
- ✅ Layout: Header
- ✅ Auth: AuthGuard
- ✅ Hooks: usePermissions, useLocalStorage
- ✅ Services: createCRUDService
- ✅ Utils: caseConverter

---

## 📋 Path to 100% Coverage

### Phase 1: Remaining Core Components (Week 1-2)

**Priority 1: Auth System (Critical)**
- [ ] ProtectedRoute component
- [ ] AuthProvider context
- [ ] useAuth hook
- [ ] Login flow integration test

**Priority 2: Layout Components**
- [ ] SearchBar
- [ ] UserMenu
- [ ] QuickActions
- [ ] FavoritePages
- [ ] RecentPages
- [ ] Sidebar variants (Desktop, Mobile, Tablet)
- [ ] SidebarContent
- [ ] MainLayout

**Priority 3: Remaining Hooks**
- [ ] useAPI
- [ ] useForm
- [ ] useDebounce
- [ ] usePagination
- [ ] useFilters
- [ ] useSorting
- [ ] useImageUpload
- [ ] usePageTitle
- [ ] useTheme

**Priority 4: Remaining Services**
- [ ] photoService
- [ ] albumService
- [ ] videoService
- [ ] partnerService
- [ ] sponsorService
- [ ] newsletterService
- [ ] chatService
- [ ] messageService
- [ ] aanmeldingenService
- [ ] userService
- [ ] roleService
- [ ] permissionService

**Priority 5: Utilities**
- [ ] apiErrorHandler
- [ ] validation

### Phase 2: Feature Components (Week 3-4)

**Albums Feature (20 components)**
- Display: AlbumCard, AlbumGrid
- Detail: AlbumDetailModal + subcomponents
- Forms: AlbumForm, PhotoSelector, etc.
- Preview: GalleryPreviewModal, sliders, etc.

**Photos Feature (15 components)**
- Display: PhotoGrid, PhotoList, PhotoDetailsModal
- Forms: PhotoForm, PhotoUploadModal, BulkUploadButton
- Layout: PhotosHeader, PhotosFilters, etc.

**Users & Permissions (6 components)**
- UserForm, RoleList, RoleForm
- PermissionList, PermissionForm

**Other Features (25+ components)**
- Chat (4 components)
- Email (4 components)
- Newsletter (4 components)
- Partners (2 components)
- Sponsors (3 components)
- Contact (2 components)
- Aanmeldingen (2 components)
- Dashboard (1 component)
- Videos (1 component)

### Phase 3: Integration Tests (Week 5)

**Auth Flow Integration**
- Login → Dashboard
- Token refresh → API calls
- Logout → Cleanup
- Permission checks → UI updates

**CRUD Flow Integration**
- Form submit → API → UI update
- Create → Read → Update → Delete
- Error handling → User feedback

**Navigation Integration**
- Route protection
- Favorites management
- Recent pages tracking
- Search functionality

---

## 🎭 E2E Testing Setup

### Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Playwright Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Structure

```
e2e/
├── auth/
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   └── permissions.spec.ts
├── content/
│   ├── photos.spec.ts
│   ├── albums.spec.ts
│   └── videos.spec.ts
├── management/
│   ├── users.spec.ts
│   ├── roles.spec.ts
│   └── permissions.spec.ts
└── fixtures/
    ├── auth.ts
    └── data.ts
```

---

## 🎯 Critical E2E Test Flows

### 1. Authentication Journey

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('complete login flow', async ({ page }) => {
    // 1. Visit login page
    await page.goto('/login')
    
    // 2. Fill credentials
    await page.fill('[name="email"]', 'admin@dekoninklijkeloop.nl')
    await page.fill('[name="password"]', 'password')
    
    // 3. Submit
    await page.click('button[type="submit"]')
    
    // 4. Verify dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // 5. Verify user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('handles invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrong')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('.error-message')).toBeVisible()
  })

  test('logout flow', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@dekoninklijkeloop.nl')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Uitloggen')
    
    // Verify redirect
    await expect(page).toHaveURL('/login')
  })
})
```

### 2. Content Management Journey

```typescript
// e2e/content/photos.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Photo Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@dekoninklijkeloop.nl')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
  })

  test('upload and manage photo', async ({ page }) => {
    // Navigate to photos
    await page.goto('/photos')
    
    // Upload photo
    await page.click('text=Upload Photo')
    await page.setInputFiles('[type="file"]', 'test-photo.jpg')
    await page.fill('[name="title"]', 'Test Photo')
    await page.click('button:has-text("Opslaan")')
    
    // Verify photo appears
    await expect(page.locator('text=Test Photo')).toBeVisible()
    
    // Edit photo
    await page.click('[data-testid="photo-1"] button:has-text("Edit")')
    await page.fill('[name="title"]', 'Updated Photo')
    await page.click('button:has-text("Opslaan")')
    
    // Verify update
    await expect(page.locator('text=Updated Photo')).toBeVisible()
    
    // Delete photo
    await page.click('[data-testid="photo-1"] button:has-text("Delete")')
    await page.click('button:has-text("Bevestigen")')
    
    // Verify deletion
    await expect(page.locator('text=Updated Photo')).not.toBeVisible()
  })
})
```

### 3. Permission Management Journey

```typescript
// e2e/management/permissions.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Permission Management', () => {
  test('manage user permissions', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@dekoninklijkeloop.nl')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Navigate to users
    await page.goto('/admin/users')
    
    // Create user
    await page.click('text=Nieuwe Gebruiker')
    await page.fill('[name="email"]', 'newuser@dekoninklijkeloop.nl')
    await page.fill('[name="name"]', 'New User')
    await page.click('button:has-text("Opslaan")')
    
    // Assign role
    await page.click('[data-testid="user-1"] button:has-text("Rollen")')
    await page.check('[value="staff"]')
    await page.click('button:has-text("Opslaan")')
    
    // Verify permissions
    await expect(page.locator('text=Staff')).toBeVisible()
  })
})
```

---

## 📊 Coverage Expansion Strategy

### Batch 1: Critical Path (30 tests)
- AuthProvider + useAuth
- ProtectedRoute
- Login/Logout flows
- Permission checks

### Batch 2: Core Hooks (50 tests)
- useAPI
- useForm
- useDebounce
- usePagination
- useFilters
- useSorting

### Batch 3: Services (60 tests)
- All feature services
- Error handling
- CRUD operations

### Batch 4: Feature Components (200+ tests)
- Albums (20 components)
- Photos (15 components)
- Users (6 components)
- Other features (25+ components)

### Batch 5: Integration (30 tests)
- Feature integration
- API integration
- Context integration

**Total Additional Tests Needed: ~370 tests**
**Target: 500+ total tests for 100% coverage**

---

## ⚡ Accelerated Timeline

### Week 1-2: Core Expansion (Current)
- [x] 162 tests completed
- [ ] +100 tests (auth, hooks, services)
- Target: 260 tests, 50% coverage

### Week 3-4: Feature Components
- [ ] +200 tests (all feature components)
- Target: 460 tests, 75% coverage

### Week 5: Integration & E2E
- [ ] +40 integration tests
- [ ] +20 E2E tests
- Target: 520 tests, 90%+ coverage

### Week 6: Polish & 100%
- [ ] Fill coverage gaps
- [ ] Optimize test performance
- [ ] Complete documentation
- Target: 100% coverage

---

## 🎯 Next Immediate Steps

1. **Install Playwright:**
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Write More Unit Tests:**
   - ProtectedRoute
   - useAPI hook
   - useForm hook
   - photoService
   - albumService

3. **Create E2E Tests:**
   - Login flow
   - Photo management
   - Permission management

4. **Monitor Coverage:**
   ```bash
   npm run test:coverage
   ```

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Target:** 100% coverage + E2E in 6 weeks  
**Current:** 162 tests, 35% coverage, Week 1