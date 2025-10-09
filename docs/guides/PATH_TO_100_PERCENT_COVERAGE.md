# 🎯 Path to 100% Test Coverage

> **Current Status**: 80-85% Coverage | 408/416 Tests Passing (98.1%)  
> **Target**: 100% Coverage | All Tests Passing  
> **Date**: 2025-01-08

---

## 📊 Current State Analysis

### Test Results Summary
- **Total Tests**: 416
- **Passing**: 408 (98.1%)
- **Failing**: 8 (1.9%)
- **Test Files**: 33 (29 fully passing, 4 with failures)
- **Coverage**: 80-85%

### Failing Tests Breakdown

#### 1. useAPI Hook (5 failures)
- ❌ `caches fetched data` - Cache invalidation timing
- ❌ `respects refetchOnMount option` - Mount behavior
- ❌ `retries on failure` - Retry logic
- ❌ `sets isFetching during refetch` - State timing
- ❌ `updates cache when mutating` - Cache update

#### 2. useTheme Hook (1 failure)
- ❌ `updates theme when system preference changes` - MediaQuery listener

#### 3. SearchBar Component (1 failure)
- ❌ `handles keyboard shortcut Ctrl+K` - Focus behavior

#### 4. useAuth Hook (1 failure)
- ❌ `throws error when used outside AuthProvider` - Error message assertion

#### 5. Unhandled Error
- ❌ Token refresh failed in AuthProvider test

---

## 🔧 Phase 1: Fix Failing Tests (Priority 1)

### Step 1.1: Fix useAPI Caching Tests
**File**: `src/hooks/__tests__/useAPI.test.ts`

**Issues**:
1. Cache timing - fetcher called multiple times
2. RefetchOnMount not working correctly
3. Retry logic not triggering
4. isFetching state not updating
5. Cache not updating on mutation

**Solution**: Add proper async handling and cache management

### Step 1.2: Fix useTheme System Preference Test
**File**: `src/hooks/__tests__/useTheme.test.ts`

**Issue**: MediaQuery change event not triggering theme update

**Solution**: Improve MediaQuery mock and event handling

### Step 1.3: Fix SearchBar Keyboard Test
**File**: `src/components/layout/__tests__/SearchBar.test.tsx`

**Issue**: Ctrl+K shortcut not focusing input

**Solution**: Fix keyboard event handling in test

### Step 1.4: Fix useAuth Error Test
**File**: `src/features/auth/hooks/__tests__/useAuth.test.tsx`

**Issue**: Error message assertion failing

**Solution**: Update error handling to throw proper error

### Step 1.5: Fix AuthProvider Unhandled Error
**File**: `src/features/auth/contexts/__tests__/AuthProvider.test.tsx`

**Issue**: Token refresh throwing unhandled error

**Solution**: Wrap in proper error handling

**Estimated Time**: 2-3 hours  
**Expected Result**: 416/416 tests passing

---

## 📈 Phase 2: Add Missing Tests (Priority 2)

### Step 2.1: Provider Tests (Estimated: +30 tests)

#### FavoritesProvider
**File**: `src/providers/__tests__/FavoritesProvider.test.tsx`

Tests needed:
- ✅ Provides initial empty favorites
- ✅ Adds page to favorites
- ✅ Removes page from favorites
- ✅ Toggles favorite status
- ✅ Checks if page is favorite
- ✅ Persists to localStorage
- ✅ Loads from localStorage on mount
- ✅ Handles max favorites limit
- ✅ Prevents duplicate favorites
- ✅ Updates on storage event

**Lines**: ~150 lines

#### SidebarProvider
**File**: `src/providers/__tests__/SidebarProvider.test.tsx`

Tests needed:
- ✅ Provides initial collapsed state
- ✅ Toggles sidebar
- ✅ Opens sidebar
- ✅ Closes sidebar
- ✅ Persists state to localStorage
- ✅ Loads state from localStorage
- ✅ Handles responsive behavior
- ✅ Updates on window resize

**Lines**: ~120 lines

#### AppProviders Integration
**File**: `src/providers/__tests__/AppProviders.test.tsx`

Tests needed:
- ✅ Renders all providers
- ✅ Provides auth context
- ✅ Provides favorites context
- ✅ Provides sidebar context
- ✅ Handles provider errors

**Lines**: ~80 lines

### Step 2.2: Service Tests (Estimated: +40 tests)

#### messageService
**File**: `src/features/contact/services/__tests__/messageService.test.ts`

Tests needed:
- ✅ Fetches messages
- ✅ Fetches message by ID
- ✅ Creates message
- ✅ Updates message status
- ✅ Deletes message
- ✅ Handles errors

**Lines**: ~100 lines

#### aanmeldingenService
**File**: `src/features/aanmeldingen/services/__tests__/aanmeldingenService.test.ts`

Tests needed:
- ✅ Fetches registrations
- ✅ Fetches registration by ID
- ✅ Creates registration
- ✅ Updates registration
- ✅ Deletes registration
- ✅ Handles errors

**Lines**: ~100 lines

#### underConstructionService
**File**: `src/features/under-construction/services/__tests__/underConstructionService.test.ts`

Tests needed:
- ✅ Fetches pages
- ✅ Updates page status
- ✅ Handles errors

**Lines**: ~60 lines

#### adminEmailService
**File**: `src/features/email/__tests__/adminEmailService.test.ts`

Tests needed:
- ✅ Fetches emails
- ✅ Sends email
- ✅ Marks as read
- ✅ Deletes email
- ✅ Handles errors

**Lines**: ~80 lines

### Step 2.3: Feature Component Tests (Estimated: +100 tests)

#### Albums Feature
**Files**: 
- `src/features/albums/components/__tests__/AlbumCard.test.tsx`
- `src/features/albums/components/__tests__/AlbumGrid.test.tsx`
- `src/features/albums/components/__tests__/AlbumForm.test.tsx`
- `src/features/albums/components/__tests__/AlbumDetailModal.test.tsx`

Tests per component: ~15-20 tests
**Total Lines**: ~600 lines

#### Photos Feature
**Files**:
- `src/features/photos/components/__tests__/PhotoGrid.test.tsx`
- `src/features/photos/components/__tests__/PhotoForm.test.tsx`
- `src/features/photos/components/__tests__/PhotoUploadModal.test.tsx`

Tests per component: ~15-20 tests
**Total Lines**: ~450 lines

#### Users Feature
**Files**:
- `src/features/users/components/__tests__/UserForm.test.tsx`

Tests: ~20 tests
**Total Lines**: ~200 lines

#### Other Features
**Files**:
- `src/features/sponsors/components/__tests__/SponsorForm.test.tsx`
- `src/features/sponsors/components/__tests__/SponsorCard.test.tsx`
- `src/features/sponsors/components/__tests__/SponsorGrid.test.tsx`
- `src/features/chat/components/__tests__/ChatWindow.test.tsx`
- `src/features/email/components/__tests__/EmailInbox.test.tsx`
- `src/features/contact/components/__tests__/ContactTab.test.tsx`

Tests per component: ~10-15 tests
**Total Lines**: ~600 lines

### Step 2.4: Page Component Tests (Estimated: +50 tests)

**Files**:
- `src/pages/__tests__/DashboardPage.test.tsx`
- `src/pages/__tests__/AlbumManagementPage.test.tsx`
- `src/pages/__tests__/PhotoManagementPage.test.tsx`
- `src/pages/__tests__/UserManagementPage.test.tsx`
- `src/pages/__tests__/SettingsPage.test.tsx`
- `src/pages/__tests__/ProfilePage.test.tsx`

Tests per page: ~8-10 tests
**Total Lines**: ~600 lines

### Step 2.5: Layout Component Tests (Estimated: +30 tests)

**Files**:
- `src/components/layout/__tests__/MainLayout.test.tsx`
- `src/components/layout/__tests__/QuickActions.test.tsx`
- `src/components/layout/__tests__/FavoritePages.test.tsx`
- `src/components/layout/__tests__/RecentPages.test.tsx`
- `src/components/layout/Sidebar/__tests__/DesktopSidebar.test.tsx`
- `src/components/layout/Sidebar/__tests__/MobileSidebar.test.tsx`
- `src/components/layout/Sidebar/__tests__/TabletSidebar.test.tsx`
- `src/components/layout/Sidebar/__tests__/SidebarContent.test.tsx`

Tests per component: ~5-10 tests
**Total Lines**: ~400 lines

**Estimated Time**: 5-7 days  
**Expected Result**: +250 tests, 90-95% coverage

---

## 🔗 Phase 3: Integration Tests (Priority 3)

### Step 3.1: Auth Flow Integration
**File**: `src/__tests__/integration/auth-flow.test.tsx`

Tests:
- ✅ Complete login flow
- ✅ Token refresh flow
- ✅ Logout flow
- ✅ Permission-based routing
- ✅ Protected route access

**Lines**: ~200 lines

### Step 3.2: CRUD Flow Integration
**File**: `src/__tests__/integration/crud-flow.test.tsx`

Tests:
- ✅ Create → Read → Update → Delete flow
- ✅ Form validation → API → UI update
- ✅ Error handling → User feedback
- ✅ Optimistic updates

**Lines**: ~250 lines

### Step 3.3: Navigation Integration
**File**: `src/__tests__/integration/navigation.test.tsx`

Tests:
- ✅ Route protection
- ✅ Favorites management
- ✅ Recent pages tracking
- ✅ Search functionality
- ✅ Breadcrumb navigation

**Lines**: ~200 lines

**Estimated Time**: 2-3 days  
**Expected Result**: +30 tests, 95-98% coverage

---

## 🎭 Phase 4: E2E Tests with Playwright (Priority 4)

### Step 4.1: Setup Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Step 4.2: Authentication E2E
**File**: `e2e/auth/login.spec.ts`

Tests:
- ✅ Complete login flow
- ✅ Invalid credentials
- ✅ Logout flow
- ✅ Session persistence
- ✅ Token refresh

**Lines**: ~150 lines

### Step 4.3: Content Management E2E
**Files**:
- `e2e/content/photos.spec.ts`
- `e2e/content/albums.spec.ts`
- `e2e/content/videos.spec.ts`

Tests per file: ~5-8 tests
**Total Lines**: ~400 lines

### Step 4.4: User Management E2E
**File**: `e2e/management/users.spec.ts`

Tests:
- ✅ Create user
- ✅ Edit user
- ✅ Assign roles
- ✅ Delete user
- ✅ Permission checks

**Lines**: ~200 lines

### Step 4.5: Navigation E2E
**File**: `e2e/content/navigation.spec.ts`

Tests:
- ✅ Sidebar navigation
- ✅ Search functionality
- ✅ Favorites
- ✅ Recent pages
- ✅ Breadcrumbs

**Lines**: ~150 lines

**Estimated Time**: 3-4 days  
**Expected Result**: +25 E2E tests, 98-100% coverage

---

## 📊 Coverage Goals by Phase

| Phase | Tests Added | Total Tests | Coverage | Timeline |
|-------|-------------|-------------|----------|----------|
| **Current** | 408 | 408 | 80-85% | ✅ Done |
| **Phase 1** | +8 fixes | 416 | 80-85% | Day 1 |
| **Phase 2** | +250 | 666 | 90-95% | Week 1-2 |
| **Phase 3** | +30 | 696 | 95-98% | Week 2-3 |
| **Phase 4** | +25 | 721 | 98-100% | Week 3-4 |

---

## 🎯 Success Criteria

### Phase 1 Complete
- ✅ All 416 tests passing
- ✅ No failing tests
- ✅ No unhandled errors

### Phase 2 Complete
- ✅ 666+ tests passing
- ✅ 90-95% coverage
- ✅ All providers tested
- ✅ All services tested
- ✅ All feature components tested
- ✅ All pages tested

### Phase 3 Complete
- ✅ 696+ tests passing
- ✅ 95-98% coverage
- ✅ Integration tests passing
- ✅ Critical flows tested

### Phase 4 Complete
- ✅ 721+ tests passing
- ✅ 98-100% coverage
- ✅ E2E tests passing
- ✅ All user journeys tested

---

## 📝 Implementation Order

### Week 1: Fix & Providers
1. **Day 1**: Fix all 8 failing tests
2. **Day 2-3**: Add FavoritesProvider tests
3. **Day 4-5**: Add SidebarProvider tests

### Week 2: Services & Components
1. **Day 1-2**: Add remaining service tests
2. **Day 3-5**: Start feature component tests (Albums, Photos)

### Week 3: Components & Integration
1. **Day 1-3**: Complete feature component tests
2. **Day 4-5**: Add integration tests

### Week 4: E2E & Polish
1. **Day 1-2**: Setup Playwright and auth E2E
2. **Day 3-4**: Add content management E2E
3. **Day 5**: Polish and final coverage report

---

## 🚀 Quick Start Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test src/hooks/__tests__/useAPI.test.ts

# Run E2E tests (after Phase 4)
npx playwright test

# Watch mode for development
npm test -- --watch
```

---

## 📚 Resources

- [Testing Setup Guide](./TESTING_SETUP_GUIDE.md)
- [Testing Implementation Summary](./TESTING_IMPLEMENTATION_SUMMARY.md)
- [Coverage Report](../reports/TESTING_COVERAGE_REPORT.md)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-08  
**Maintained By**: Development Team  
**Target Completion**: 4 weeks