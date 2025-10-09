# 🧪 Comprehensive Testing Plan - DKL25 Admin Panel

> **Versie:** 1.0 | **Status:** Planning | **Laatste Update:** 2025-01-08

Complete testing strategie om 100% test coverage te bereiken voor het DKL25 Admin Panel.

---

## 📋 Inhoudsopgave

- [Executive Summary](#-executive-summary)
- [Testing Strategy](#-testing-strategy)
- [Test Coverage Goals](#-test-coverage-goals)
- [Testing Layers](#-testing-layers)
- [Implementation Roadmap](#-implementation-roadmap)
- [Test Specifications](#-test-specifications)
- [Tools & Infrastructure](#-tools--infrastructure)
- [Best Practices](#-best-practices)
- [Success Metrics](#-success-metrics)

---

## 🎯 Executive Summary

### Current State
- **Testing Framework:** Vitest + React Testing Library ✅
- **Current Coverage:** ~15% (3 UI component tests)
- **Target Coverage:** 75%+ overall, 80%+ for critical paths
- **Estimated Effort:** 80-120 hours

### Scope
- **96 Components** across 17 features
- **20+ Services** (CRUD operations, API integrations)
- **15+ Custom Hooks** (state management, utilities)
- **Authentication & Authorization** (RBAC system)
- **API Integration** (Supabase, Cloudinary)

---

## 📊 Testing Strategy

### Testing Pyramid

```
                    ▲
                   / \
                  /   \
                 / E2E \          10% - Critical user flows
                /-------\
               /         \
              / Integration\      30% - Feature integration
             /-------------\
            /               \
           /   Unit Tests    \    60% - Components, hooks, utils
          /___________________\
```

### Coverage Distribution

| Layer | Target | Priority | Effort |
|-------|--------|----------|--------|
| **Unit Tests** | 60% | High | 50h |
| **Integration Tests** | 30% | Medium | 30h |
| **E2E Tests** | 10% | Medium | 20h |
| **Total** | **75%+** | - | **100h** |

---

## 🎯 Test Coverage Goals

### By Category

| Category | Current | Target | Priority |
|----------|---------|--------|----------|
| **UI Components** | 3% | 80% | 🔴 Critical |
| **Services** | 0% | 70% | 🔴 Critical |
| **Hooks** | 0% | 75% | 🟡 High |
| **Utils** | 0% | 85% | 🟡 High |
| **Auth System** | 0% | 90% | 🔴 Critical |
| **API Integration** | 0% | 70% | 🟡 High |
| **Features** | 0% | 75% | 🟡 High |

### Critical Paths (90%+ Coverage Required)

1. **Authentication Flow**
   - Login/Logout
   - Token refresh
   - Session management

2. **Authorization (RBAC)**
   - Permission checks
   - Role management
   - Protected routes

3. **Data Operations**
   - CRUD operations
   - Error handling
   - Data validation

---

## 🏗️ Testing Layers

### 1. Unit Tests (60% Coverage Target)

#### 1.1 UI Components (80+ components)

**Priority 1: Core UI Components** (Week 1-2)
- ✅ [`ConfirmDialog`](../../src/components/ui/ConfirmDialog.tsx) - Already tested
- ✅ [`EmptyState`](../../src/components/ui/EmptyState.tsx) - Already tested
- ✅ [`LoadingGrid`](../../src/components/ui/LoadingGrid.tsx) - Already tested
- ⚪ [`Modal`](../../src/components/ui/Modal.tsx) - Needs tests
- ⚪ [`DataTable`](../../src/components/ui/DataTable.tsx) - Needs tests

**Priority 2: Layout Components** (Week 2-3)
- ⚪ [`MainLayout`](../../src/components/layout/MainLayout.tsx)
- ⚪ [`Header`](../../src/components/layout/Header.tsx)
- ⚪ [`Sidebar`](../../src/components/layout/Sidebar/) (Desktop, Mobile, Tablet)
- ⚪ [`SearchBar`](../../src/components/layout/SearchBar.tsx)
- ⚪ [`UserMenu`](../../src/components/layout/UserMenu.tsx)
- ⚪ [`QuickActions`](../../src/components/layout/QuickActions.tsx)
- ⚪ [`FavoritePages`](../../src/components/layout/FavoritePages.tsx)
- ⚪ [`RecentPages`](../../src/components/layout/RecentPages.tsx)

**Priority 3: Auth Components** (Week 3)
- ⚪ [`AuthGuard`](../../src/components/auth/AuthGuard.tsx)
- ⚪ [`ProtectedRoute`](../../src/components/auth/ProtectedRoute.tsx)
- ⚪ [`LoginPage`](../../src/pages/LoginPage.tsx)

**Priority 4: Feature Components** (Week 4-8)
- Albums (20 components)
- Photos (15 components)
- Users & Permissions (6 components)
- Chat (4 components)
- Email (4 components)
- Newsletter (4 components)
- Partners (2 components)
- Sponsors (3 components)
- Contact (2 components)
- Aanmeldingen (2 components)
- Dashboard (1 component)
- Videos (1 component)

#### 1.2 Services (20+ services)

**Priority 1: Core Services** (Week 3-4)
- ⚪ [`createCRUDService`](../../src/lib/services/createCRUDService.ts) - Factory function
- ⚪ Auth service - Authentication
- ⚪ [`userService`](../../src/features/users/services/userService.ts) - User management
- ⚪ [`roleService`](../../src/features/users/services/roleService.ts) - Role management
- ⚪ [`permissionService`](../../src/features/users/services/permissionService.ts) - Permission management

**Priority 2: Feature Services** (Week 5-6)
- ⚪ [`albumService`](../../src/features/albums/services/albumService.ts)
- ⚪ [`videoService`](../../src/features/videos/services/videoService.ts)
- ⚪ [`partnerService`](../../src/features/partners/services/partnerService.ts)
- ⚪ [`sponsorService`](../../src/features/sponsors/services/sponsorService.ts)
- ⚪ [`newsletterService`](../../src/features/newsletter/services/newsletterService.ts)
- ⚪ [`chatService`](../../src/features/chat/services/chatService.ts)
- ⚪ [`messageService`](../../src/features/contact/services/messageService.ts)
- ⚪ [`aanmeldingenService`](../../src/features/aanmeldingen/services/aanmeldingenService.ts)

**Priority 3: API Clients** (Week 6)
- ⚪ [`supabase`](../../src/api/client/supabase.ts) client
- ⚪ [`cloudinary`](../../src/api/client/cloudinary.ts) client
- ⚪ [`auth`](../../src/api/client/auth.ts) client

#### 1.3 Custom Hooks (15+ hooks)

**Priority 1: Core Hooks** (Week 4-5)
- ⚪ [`useAuth`](../../src/features/auth/hooks/useAuth.ts)
- ⚪ [`usePermissions`](../../src/hooks/usePermissions.ts)
- ⚪ [`useAPI`](../../src/hooks/useAPI.ts)
- ⚪ [`useForm`](../../src/hooks/useForm.ts)

**Priority 2: Utility Hooks** (Week 5)
- ⚪ [`useLocalStorage`](../../src/hooks/useLocalStorage.ts)
- ⚪ [`useDebounce`](../../src/hooks/useDebounce.ts)
- ⚪ [`usePagination`](../../src/hooks/usePagination.ts)
- ⚪ [`useFilters`](../../src/hooks/useFilters.ts)
- ⚪ [`useSorting`](../../src/hooks/useSorting.ts)
- ⚪ [`useImageUpload`](../../src/hooks/useImageUpload.ts)
- ⚪ [`usePageTitle`](../../src/hooks/usePageTitle.ts)
- ⚪ [`useTheme`](../../src/hooks/useTheme.ts)

**Priority 3: Feature Hooks** (Week 6)
- ⚪ [`useNavigationHistory`](../../src/features/navigation/hooks/useNavigationHistory.ts)
- ⚪ [`usePhotoGallery`](../../src/features/albums/components/preview/hooks/usePhotoGallery.ts)
- ⚪ [`useSwipe`](../../src/features/albums/components/preview/hooks/useSwipe.ts)
- ⚪ [`useChat`](../../src/features/chat/hooks/useChat.ts)

#### 1.4 Utilities (10+ utils)

**Priority 1: Core Utils** (Week 3)
- ⚪ [`caseConverter`](../../src/utils/caseConverter.ts) - keysToCamel, keysToSnake
- ⚪ [`apiErrorHandler`](../../src/utils/apiErrorHandler.ts) - Error handling
- ⚪ [`validation`](../../src/utils/validation.ts) - Form validation

**Priority 2: Helper Utils** (Week 3)
- ⚪ Base types validation
- ⚪ Date formatters
- ⚪ String helpers

### 2. Integration Tests (30% Coverage Target)

#### 2.1 Feature Integration (Week 7-9)

**Authentication Flow**
- Login → Dashboard navigation
- Token refresh → API calls
- Logout → Cleanup

**RBAC Integration**
- Permission check → UI rendering
- Role assignment → Permission update
- Protected route → Access control

**Data Flow**
- Form submission → API call → UI update
- CRUD operations → Cache invalidation
- Real-time updates → State sync

**Media Upload**
- File selection → Cloudinary upload → Database save
- Bulk upload → Progress tracking
- Error handling → Retry logic

#### 2.2 Context Integration (Week 8)

- AuthProvider + useAuth
- SidebarProvider + useSidebar
- NavigationHistoryProvider + useNavigationHistory
- FavoritesProvider + useFavorites

#### 2.3 API Integration (Week 9)

- Supabase CRUD operations
- Cloudinary uploads
- Error handling
- Cache management

### 3. E2E Tests (10% Coverage Target)

#### 3.1 Critical User Flows (Week 10-11)

**Authentication Journey**
```
1. Visit login page
2. Enter credentials
3. Submit form
4. Verify dashboard load
5. Verify user menu
6. Logout
7. Verify redirect to login
```

**Content Management Journey**
```
1. Login as admin
2. Navigate to Photos
3. Upload new photo
4. Edit photo details
5. Add to album
6. Verify in album
7. Delete photo
8. Verify deletion
```

**Permission Management Journey**
```
1. Login as admin
2. Navigate to Users
3. Create new user
4. Assign role
5. Verify permissions
6. Login as new user
7. Verify access restrictions
```

---

## 📅 Implementation Roadmap

### Phase 1: Foundation (Week 1-3) - 25 hours

**Week 1: Test Infrastructure**
- ✅ Vitest setup (already done)
- ⚪ Extend test utilities
- ⚪ Mock setup (Supabase, Cloudinary)
- ⚪ CI/CD integration
- ⚪ Coverage reporting

**Week 2: Core UI Components**
- ⚪ Modal tests
- ⚪ DataTable tests
- ⚪ Layout component tests
- ⚪ Navigation component tests

**Week 3: Core Services & Utils**
- ⚪ CRUD service tests
- ⚪ Case converter tests
- ⚪ Error handler tests
- ⚪ Auth service tests

### Phase 2: Authentication & Authorization (Week 4-5) - 20 hours

**Week 4: Auth System**
- ⚪ AuthProvider tests
- ⚪ useAuth hook tests
- ⚪ usePermissions hook tests
- ⚪ AuthGuard tests
- ⚪ ProtectedRoute tests

**Week 5: RBAC System**
- ⚪ Role service tests
- ⚪ Permission service tests
- ⚪ User service tests
- ⚪ Integration tests

### Phase 3: Features (Week 6-9) - 40 hours

**Week 6: Media Features**
- ⚪ Photo components tests
- ⚪ Album components tests
- ⚪ Video components tests
- ⚪ Service tests

**Week 7: Communication Features**
- ⚪ Chat components tests
- ⚪ Email components tests
- ⚪ Newsletter components tests
- ⚪ Contact components tests

**Week 8: Management Features**
- ⚪ Partner components tests
- ⚪ Sponsor components tests
- ⚪ User management tests
- ⚪ Dashboard tests

**Week 9: Integration Tests**
- ⚪ Feature integration tests
- ⚪ API integration tests
- ⚪ Context integration tests

### Phase 4: E2E & Polish (Week 10-12) - 25 hours

**Week 10: E2E Setup**
- ⚪ Playwright/Cypress setup
- ⚪ Test data seeding
- ⚪ Environment setup

**Week 11: Critical Flows**
- ⚪ Authentication flow
- ⚪ Content management flow
- ⚪ Permission management flow

**Week 12: Polish & Documentation**
- ⚪ Coverage gaps analysis
- ⚪ Test documentation
- ⚪ CI/CD optimization
- ⚪ Team training

---

## 📝 Test Specifications

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ComponentName />)
      expect(screen.getByRole('...')).toBeInTheDocument()
    })

    it('renders with custom props', () => {
      render(<ComponentName prop="value" />)
      expect(screen.getByText('value')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      
      render(<ComponentName onClick={onClick} />)
      await user.click(screen.getByRole('button'))
      
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('State Management', () => {
    it('updates state correctly', async () => {
      const user = userEvent.setup()
      render(<ComponentName />)
      
      await user.type(screen.getByRole('textbox'), 'test')
      
      expect(screen.getByDisplayValue('test')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays error message', () => {
      render(<ComponentName error="Error message" />)
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })
})
```

### Service Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serviceName } from './serviceName'
import { supabase } from '@/api/client/supabase'

vi.mock('@/api/client/supabase')

describe('serviceName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchAll', () => {
    it('fetches all items successfully', async () => {
      const mockData = [{ id: '1', name: 'Test' }]
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockData, error: null })
      } as any)

      const result = await serviceName.fetchAll()
      
      expect(result).toEqual(mockData)
      expect(supabase.from).toHaveBeenCalledWith('table_name')
    })

    it('handles errors correctly', async () => {
      const mockError = new Error('Database error')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: mockError })
      } as any)

      await expect(serviceName.fetchAll()).rejects.toThrow('Database error')
    })
  })

  describe('create', () => {
    it('creates item successfully', async () => {
      const newItem = { name: 'New Item' }
      const createdItem = { id: '1', ...newItem }
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: createdItem, error: null })
          })
        })
      } as any)

      const result = await serviceName.create(newItem)
      
      expect(result).toEqual(createdItem)
    })
  })

  describe('update', () => {
    it('updates item successfully', async () => {
      const updates = { name: 'Updated' }
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as any)

      await expect(serviceName.update('1', updates)).resolves.not.toThrow()
    })
  })

  describe('delete', () => {
    it('deletes item successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as any)

      await expect(serviceName.delete('1')).resolves.not.toThrow()
    })
  })
})
```

### Hook Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useHookName } from './useHookName'

describe('useHookName', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useHookName())
    
    expect(result.current.value).toBe(initialValue)
    expect(result.current.loading).toBe(false)
  })

  it('updates state correctly', async () => {
    const { result } = renderHook(() => useHookName())
    
    act(() => {
      result.current.setValue(newValue)
    })
    
    await waitFor(() => {
      expect(result.current.value).toBe(newValue)
    })
  })

  it('handles async operations', async () => {
    const { result } = renderHook(() => useHookName())
    
    act(() => {
      result.current.fetchData()
    })
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBeDefined()
    })
  })

  it('handles errors', async () => {
    const { result } = renderHook(() => useHookName())
    
    act(() => {
      result.current.fetchDataWithError()
    })
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })
  })
})
```

### Integration Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { AppProviders } from '@/providers/AppProviders'

describe('Feature Integration', () => {
  it('completes full user flow', async () => {
    const user = userEvent.setup()
    
    render(
      <AppProviders>
        <FeatureComponent />
      </AppProviders>
    )

    expect(screen.getByText('Initial State')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      expect(screen.getByText('Updated State')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })

  it('handles error states in flow', async () => {
    const user = userEvent.setup()
    
    render(
      <AppProviders>
        <FeatureComponent />
      </AppProviders>
    )

    await user.click(screen.getByRole('button', { name: /trigger error/i }))

    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument()
    })
  })
})
```

---

## 🛠️ Tools & Infrastructure

### Testing Stack

| Tool | Purpose | Status |
|------|---------|--------|
| **Vitest** | Test runner | ✅ Configured |
| **React Testing Library** | Component testing | ✅ Configured |
| **@testing-library/user-event** | User interactions | ✅ Configured |
| **@testing-library/jest-dom** | Custom matchers | ✅ Configured |
| **MSW** | API mocking | ⚪ To add |
| **Playwright/Cypress** | E2E testing | ⚪ To add |

### Test Utilities Enhancement

**Location:** [`src/test/utils.tsx`](../../src/test/utils.tsx)

```typescript
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  const queryClient = createTestQueryClient()
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

export const mockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@dekoninklijkeloop.nl',
  role: 'admin',
  permissions: ['admin:access'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const mockPhoto = (overrides = {}) => ({
  id: '1',
  title: 'Test Photo',
  url: 'https://example.com/photo.jpg',
  visible: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const mockAlbum = (overrides = {}) => ({
  id: '1',
  title: 'Test Album',
  description: 'Test Description',
  cover_photo: 'https://example.com/cover.jpg',
  visible: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const mockPartner = (overrides = {}) => ({
  id: '1',
  name: 'Test Partner',
  logo: 'https://example.com/logo.png',
  website: 'https://example.com',
  tier: 'gold' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export * from '@testing-library/react'
export { renderWithProviders as render }
```

### Mock Service Workers (MSW) Setup

```typescript
import { setupServer } from 'msw/node'
import { rest } from 'msw'

export const handlers = [
  rest.post('https://api.dekoninklijkeloop.nl/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser()
      })
    )
  }),
  
  rest.get('https://api.dekoninklijkeloop.nl/api/auth/profile', (req, res, ctx) => {
    return res(ctx.json(mockUser()))
  }),
  
  rest.get('*/photos', (req, res, ctx) => {
    return res(ctx.json([mockPhoto(), mockPhoto({ id: '2' })]))
  })
]

export const server = setupServer(...handlers)
```

### CI/CD Integration

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
      
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 75" | bc -l) )); then
            echo "Coverage $COVERAGE% is below threshold 75%"
            exit 1
          fi
```

---

## 🎯 Best Practices

### 1. Test Behavior, Not Implementation

✅ **GOED:**
```typescript
it('displays error message when form is invalid', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  
  await user.click(screen.getByRole('button', { name: /login/i }))
  
  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
})
```

❌ **VERMIJD:**
```typescript
it('sets error state to true', () => {
  const { result } = renderHook(() => useForm())
  result.current.setError(true)
  expect(result.current.error).toBe(true)
})
```

### 2. Use Semantic Queries

**Priority:**
1. `getByRole` - Most accessible
2. `getByLabelText` - For forms
3. `getByPlaceholderText` - For inputs
4. `getByText` - For content
5. `getByTestId` - Last resort

```typescript
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByPlaceholderText(/enter email/i)
screen.getByText(/welcome/i)
screen.getByTestId('custom-element')
```

### 3. Mock External Dependencies

```typescript
vi.mock('@/api/client/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn()
    }
  }
}))

vi.mock('@/api/client/cloudinary', () => ({
  uploadToCloudinary: vi.fn().mockResolvedValue({
    secure_url: 'https://example.com/image.jpg'
  })
}))
```

### 4. Test Error States

```typescript
it('handles API errors gracefully', async () => {
  vi.mocked(api.fetch).mockRejectedValue(new Error('Network error'))
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument()
  })
})
```

### 5. Test Loading States

```typescript
it('shows loading state while fetching', async () => {
  render(<Component />)
  
  expect(screen.getByTestId('loading')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
  })
})
```

### 6. Test Accessibility

```typescript
it('is accessible', async () => {
  const { container } = render(<Component />)
  
  expect(screen.getByRole('button')).toHaveAccessibleName('Submit')
  expect(screen.getByLabelText('Email')).toBeRequired()
})
```

### 7. Clean Up After Tests

```typescript
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})

afterAll(() => {
  vi.restoreAllMocks()
})
```

---

## 📊 Success Metrics

### Coverage Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Overall Coverage** | 75%+ | Vitest coverage report |
| **Critical Paths** | 90%+ | Manual verification |
| **UI Components** | 80%+ | Component test count |
| **Services** | 70%+ | Service test count |
| **Hooks** | 75%+ | Hook test count |
| **Utils** | 85%+ | Utility test count |

### Quality Metrics

| Metric | Target | Status |
|--------|--------|--------|
| **Test Execution Time** | < 30s | ⚪ TBD |
| **Flaky Tests** | 0% | ⚪ TBD |
| **Test Maintainability** | High | ⚪ TBD |
| **CI/CD Integration** | 100% | ⚪ TBD |
| **Code Review Coverage** | 100% | ⚪ TBD |

### Progress Tracking

```
Week 1:  ████░░░░░░░░ 10%  - Test infrastructure
Week 2:  ████████░░░░ 20%  - Core UI components
Week 3:  ████████████ 30%  - Services & utils
Week 4:  ████████████ 40%  - Auth system
Week 5:  ████████████ 50%  - RBAC & hooks
Week 6:  ████████████ 60%  - Media features
Week 7:  ████████████ 65%  - Communication features
Week 8:  ████████████ 70%  - Management features
Week 9:  ████████████ 75%  - Integration tests
Week 10: ████████████ 80%  - E2E setup
Week 11: ████████████ 85%  - Critical flows
Week 12: ████████████ 90%+ - Polish & docs
```

### Weekly Deliverables

| Week | Deliverable | Tests Added | Coverage Gain |
|------|-------------|-------------|---------------|
| 1 | Test infrastructure | 0 | 0% |
| 2 | Core UI tests | 15 | +10% |
| 3 | Service tests | 20 | +10% |
| 4 | Auth tests | 15 | +10% |
| 5 | Hook tests | 15 | +10% |
| 6 | Feature tests (Media) | 25 | +10% |
| 7 | Feature tests (Comm) | 20 | +5% |
| 8 | Feature tests (Mgmt) | 20 | +5% |
| 9 | Integration tests | 15 | +5% |
| 10 | E2E setup | 5 | +5% |
| 11 | E2E tests | 10 | +5% |
| 12 | Polish | 5 | +5% |

---

## 📚 Resources

### Internal Documentation
- [Testing Guide](./testing.md) - Current testing setup
- [Components Reference](../architecture/components.md) - All components
- [Auth System](../architecture/authentication-and-authorization.md) - Auth testing
- [API Integration](./api-integration.md) - API mocking
- [State Management](./state-management.md) - Context testing
- [Refactoring Guide](./refactoring.md) - Code patterns

### External Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)

### Example Tests
- [`ConfirmDialog.test.tsx`](../../src/components/ui/__tests__/ConfirmDialog.test.tsx)
- [`EmptyState.test.tsx`](../../src/components/ui/__tests__/EmptyState.test.tsx)
- [`LoadingGrid.test.tsx`](../../src/components/ui/__tests__/LoadingGrid.test.tsx)

---

## 🎯 Next Steps

### Immediate Actions (Week 1)

1. ✅ Review and approve testing plan
2. ⚪ Set up additional test utilities
3. ⚪ Configure MSW for API mocking
4. ⚪ Create test templates
5. ⚪ Set up CI/CD pipeline
6. ⚪ Begin Phase 1 implementation

### Team Preparation

- [ ] Team review meeting - Schedule testing plan review
- [ ] Testing workshop - Train team on Vitest & RTL
- [ ] Tool training - MSW, Playwright setup
- [ ] Documentation review - Ensure all understand patterns
- [ ] Sprint planning - Allocate testing tasks

### Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Time overrun | High | Prioritize critical paths first |
| Flaky tests | Medium | Strict mock management |
| Low coverage | High | Weekly reviews & adjustments |
| Team capacity | Medium | Pair programming on tests |
| Technical debt | Low | Refactor as we test |

---

## ✅ Acceptance Criteria

### Phase Completion Criteria

**Phase 1 Complete When:**
- [ ] Test infrastructure fully configured
- [ ] All core UI components tested
- [ ] Core services have 70%+ coverage
- [ ] CI/CD pipeline running tests

**Phase 2 Complete When:**
- [ ] Auth system has 90%+ coverage
- [ ] RBAC fully tested
- [ ] All auth flows verified
- [ ] Permission checks validated

**Phase 3 Complete When:**
- [ ] All features have 75%+ coverage
- [ ] Integration tests passing
- [ ] API mocking complete
- [ ] Context integration tested

**Phase 4 Complete When:**
- [ ] E2E tests for critical flows
- [ ] 75%+ overall coverage achieved
- [ ] Documentation complete
- [ ] Team trained on testing

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Status:** Planning  
**Estimated Completion:** 12 weeks  
**Target Coverage:** 75%+  
**Maintainer:** Development Team