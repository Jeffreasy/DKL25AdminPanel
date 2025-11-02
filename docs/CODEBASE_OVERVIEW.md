# 🏗️ DKL25 Admin Panel - Codebase Overview

> **Version:** 1.0 | **Last Updated:** 2025-11-02  
> **High-level overzicht van de gehele codebase**

---

## 📋 Quick Reference

| Aspect | Details |
|--------|---------|
| **Project Type** | React SPA Admin Panel |
| **Language** | TypeScript 5.6+ |
| **Framework** | React 18 + Vite 6 |
| **Total Features** | 16 modules |
| **Total Pages** | 15+ |
| **Test Coverage** | 80-85% |
| **Lines of Code** | ~15,000+ |
| **Components** | 96+ |
| **API Clients** | 12+ |

---

## 🎯 Project Purpose

DKL25 Admin Panel is een moderne, type-safe admin interface voor het beheren van De Koninklijke Loop 25 evenement. Het biedt complete CRUD functionaliteit voor content management, user management, en business operations.

### Key Capabilities

- 📸 **Content Management**: Albums, foto's, video's, en newsletters
- 👥 **User Management**: RBAC systeem met 19 resources en 58 permissions
- 🤝 **Business Management**: Partners en sponsors
- 💬 **Communication**: Chat, contact, en email management
- 📊 **Analytics**: Dashboard en reporting
- 🔐 **Security**: JWT authentication met role-based access control

---

## 📁 High-Level Architecture

```
DKL25AdminPanel/
│
├── Frontend (React + TypeScript)
│   ├── Feature Modules (16)      # Business logic per domein
│   ├── Shared Components (96+)   # Herbruikbare UI components
│   ├── Custom Hooks (15+)        # Reusable React logic
│   ├── API Layer (12 clients)    # Backend communication
│   ├── Providers (4)             # Global state management
│   └── Pages (15+)               # Route components
│
├── Backend Integration
│   ├── Go Fiber REST API         # Main backend
│   ├── PostgreSQL Database       # Data storage
│   ├── Redis Cache              # Performance optimization
│   └── Cloudinary               # Media storage
│
├── Testing Infrastructure
│   ├── Unit Tests (425+)         # Component & logic tests
│   ├── Integration Tests         # Feature tests
│   └── E2E Tests (Playwright)   # End-to-end scenarios
│
└── Documentation (20+ docs)
    ├── Architecture Guides       # System design
    ├── Feature Docs             # Feature documentation
    ├── Development Guides       # How-to guides
    └── Testing Docs             # Testing strategy
```

---

## 🏛️ Architecture Patterns

### 1. Feature-Based Architecture

Elke feature is een zelfstandige module met eigen:
- Components (UI)
- Hooks (Logic)
- Services (Business logic)
- Types (Type definitions)
- Tests (Test suite)

**Example**: [`src/features/albums/`](../src/features/albums/)

### 2. Separation of Concerns

```
Presentation Layer → Business Logic → Data Layer → Backend API
    (Components)      (Hooks/Services)  (API Clients)  (REST API)
```

### 3. Type Safety

Volledige TypeScript coverage met strict mode:
- Props interfaces voor alle components
- API response types
- Feature-specific types
- Shared base types

### 4. State Management Strategy

```
Local State (useState)
    ↓
Feature State (Context API)
    ↓
Server State (React Query)
    ↓
Global State (Providers)
```

---

## 🔑 Key Technologies

### Core Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI Framework |
| **TypeScript** | 5.6 | Type Safety |
| **Vite** | 6.0 | Build Tool |
| **Tailwind CSS** | 3.4 | Styling |
| **React Router** | 6.28 | Routing |
| **React Query** | 5.62 | Server State |

### Testing

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit/Integration testing |
| **React Testing Library** | Component testing |
| **Playwright** | E2E testing |
| **MSW** | API mocking |
| **@vitest/coverage-v8** | Coverage reporting |

### Key Libraries

| Library | Purpose |
|---------|---------|
| **@headlessui/react** | Accessible UI primitives |
| **@heroicons/react** | Icon system |
| **@dnd-kit** | Drag & drop |
| **@tiptap** | Rich text editing |
| **react-hook-form** | Form management |
| **zod** | Schema validation |
| **axios** | HTTP client |
| **date-fns** | Date utilities |

---

## 📦 Feature Modules Breakdown

### Content Management (5 features)
```
albums/      ⭐⭐⭐⭐⭐  Complete, ~2000 LOC, 85% coverage
photos/      ⭐⭐☆☆☆  Minimal, ~300 LOC, 60% coverage
videos/      ⭐⭐⭐⭐☆  Good, ~800 LOC, 80% coverage
newsletter/  ⭐⭐⭐☆☆  Adequate, ~600 LOC, 65% coverage
steps/       ❓         Unknown, needs audit
```

### User & Access (2 features)
```
auth/        ⭐⭐⭐⭐⭐  Excellent, ~500 LOC, 90% coverage
users/       ⭐⭐⭐☆☆  Needs work, ~1200 LOC, 70% coverage
```

### Communication (4 features)
```
chat/        ❓         Unknown, needs audit
contact/     ⭐⭐☆☆☆  Minimal, ~200 LOC, 75% coverage
email/       ❓         Unknown, needs audit
aanmeldingen/ ⭐⭐⭐☆☆  Good, ~300 LOC, 80% coverage
```

### Business (2 features)
```
partners/    ⭐⭐⭐⭐☆  Good, ~400 LOC, 80% coverage
sponsors/    ⭐⭐⭐⭐☆  Good, ~400 LOC, 80% coverage
```

### System (3 features)
```
dashboard/   ⭐☆☆☆☆  Minimal, ~100 LOC, needs expansion
navigation/  ❓         Unknown, needs audit
under-const/ ❓         Unknown, needs audit
```

**Detailed Documentation**: [`docs/architecture/FEATURES_DOCUMENTATION.md`](architecture/FEATURES_DOCUMENTATION.md)

---

## 🧩 Component Organization

### Shared Components ([`src/components/`](../src/components/))

```
components/
├── auth/           # Authentication components (2)
│   ├── AuthGuard.tsx
│   └── ProtectedRoute.tsx
│
├── common/         # Common utilities (1)
│   └── LoadingSkeleton.tsx
│
├── layout/         # Layout components (7+)
│   └── UserMenu.tsx
│
├── typography/     # Typography system (1)
│   └── typography.tsx
│
└── ui/            # UI primitives (5)
    ├── ConfirmDialog.tsx
    ├── DataTable.tsx
    ├── EmptyState.tsx
    ├── LoadingGrid.tsx
    └── Modal.tsx
```

### Feature Components

Elk feature module heeft eigen components in:
- `src/features/[feature]/components/`
- Subcategorieën: forms/, lists/, modals/, display/, etc.

---

## 🔌 API Layer

### API Clients ([`src/api/client/`](../src/api/client/))

```
api/client/
├── albumClient.ts          # Albums CRUD
├── auth.ts                 # Authentication
├── cloudinary.ts           # Image uploads
├── contactClient.ts        # Contact messages
├── imageUploadClient.ts    # Image management
├── partnerClient.ts        # Partners CRUD
├── photos.ts              # Photos CRUD
├── rbacClient.ts          # RBAC operations
├── sponsorClient.ts       # Sponsors CRUD
├── stepsClient.ts         # Steps CRUD
├── supabase.ts            # Supabase client
├── underConstructionClient.ts
└── videoClient.ts         # Videos CRUD
```

### API Pattern

Alle clients volgen consistent pattern:
```typescript
export const [resource]Client = {
  getAll: () => axios.get('/[resource]'),
  getById: (id: string) => axios.get(`/[resource]/${id}`),
  create: (data: T) => axios.post('/[resource]', data),
  update: (id: string, data: T) => axios.put(`/[resource]/${id}`, data),
  delete: (id: string) => axios.delete(`/[resource]/${id}`)
}
```

---

## 🪝 Custom Hooks

### Global Hooks ([`src/hooks/`](../src/hooks/))

| Hook | Purpose | LOC | Tests |
|------|---------|-----|-------|
| `useAuth` | Authentication state | 80 | ✅ |
| `usePermissions` | RBAC checks | 120 | ✅ |
| `useAPI` | API calls wrapper | 100 | ✅ |
| `useForm` | Form handling | 150 | ✅ |
| `usePagination` | Pagination logic | 80 | ✅ |
| `useFilters` | Data filtering | 90 | ✅ |
| `useSorting` | Data sorting | 70 | ✅ |
| `useImageUpload` | Image uploads | 140 | ✅ |
| `useDebounce` | Input debouncing | 30 | ✅ |
| `useLocalStorage` | Local storage | 60 | ✅ |
| `useTheme` | Theme management | 50 | ✅ |
| `usePageTitle` | Page title | 40 | ❌ |

**Total**: 15+ hooks, ~1,010 LOC

---

## 🧪 Testing Strategy

### Test Coverage Overview

| Category | Coverage | Tests | Status |
|----------|----------|-------|--------|
| **Components** | 85% | 180+ | ✅ Excellent |
| **Hooks** | 80% | 120+ | ✅ Good |
| **Services** | 75% | 80+ | ✅ Good |
| **Utils** | 90% | 45+ | ✅ Excellent |
| **E2E** | Basic | 3 | ⚠️ Needs expansion |
| **Overall** | 80-85% | 425+ | ✅ Excellent |

### Test Organization

```
Feature tests:     src/features/[feature]/__tests__/
Component tests:   src/components/[category]/__tests__/
Hook tests:        src/hooks/__tests__/
Service tests:     src/[feature]/services/__tests__/
E2E tests:         e2e/
Test utilities:    src/test/
```

**Complete Guide**: [`docs/testing/README.md`](testing/README.md)

---

## 📄 Pages & Routing

### Main Pages ([`src/pages/`](../src/pages/))

| Page | Route | RBAC | Status |
|------|-------|------|--------|
| `DashboardPage` | `/` | ✅ | Active |
| `LoginPage` | `/login` | ❌ | Active |
| `AlbumManagementPage` | `/albums` | ✅ | Active |
| `PhotoManagementPage` | `/photos` | ✅ | Active |
| `VideoManagementPage` | `/videos` | ✅ | Active |
| `NewsletterManagementPage` | `/newsletter` | ✅ | Active |
| `PartnerManagementPage` | `/partners` | ✅ | Active |
| `SponsorManagementPage` | `/sponsors` | ✅ | Active |
| `UserManagementPage` | `/users` | ✅ | Active |
| `AdminPermissionsPage` | `/permissions` | ✅ | Active |
| `StepsAdminPage` | `/steps` | ✅ | Active |
| `MediaManagementPage` | `/media` | ✅ | Active |
| `ProfilePage` | `/profile` | ✅ | Active |
| `SettingsPage` | `/settings` | ✅ | Active |
| `AccessDeniedPage` | `/access-denied` | ❌ | Active |
| `NotFoundPage` | `/*` | ❌ | Active |
| `UnderConstructionPage` | Various | ✅ | Conditional |

**Total**: 17 pages

---

## 🔐 Security & RBAC

### Authentication Flow

```
Login → JWT Token (20 min) + Refresh Token (7 days)
  ↓
Token Storage (localStorage + httpOnly cookie)
  ↓
Automatic Refresh (before expiration)
  ↓
Logout → Token cleanup
```

### RBAC System

- **Resources**: 19 (albums, photos, videos, users, etc.)
- **Permissions**: 58 granular permissions
- **Roles**: Admin, Staff, Custom roles
- **Cache**: Redis with 97% hit rate
- **Backend**: V1.48.0+

**Complete Guide**: [`docs/architecture/RBAC_FRONTEND.md`](architecture/RBAC_FRONTEND.md)

---

## 🎨 Styling System

### Tailwind CSS Configuration

```javascript
// tailwind.config.cjs
{
  theme: {
    extend: {
      colors: {
        primary: {...},    // Brand colors
        secondary: {...},
        accent: {...}
      },
      spacing: {...},      // Custom spacing
      typography: {...}    // Typography scale
    }
  }
}
```

### Design System

- **Colors**: Primary, Secondary, Accent, Semantic
- **Typography**: Headings (H1-H6), Body, Small
- **Spacing**: 4px base grid
- **Components**: Consistent UI primitives
- **Responsive**: Mobile-first approach

**Style Guide**: [`docs/guides/styling.md`](guides/styling.md)

---

## 📚 Documentation Structure

### Complete Documentation Map

```
docs/
├── README.md                           # Documentation hub
├── CODEBASE_OVERVIEW.md               # This file
├── BACKEND_API_REQUIREMENTS.md        # API specs
│
├── architecture/                       # Architecture docs
│   ├── PROJECT_STRUCTURE.md           # 🆕 Project structure
│   ├── FEATURES_DOCUMENTATION.md      # 🆕 Features detail
│   ├── Auth_system.md                 # Auth deep-dive
│   ├── RBAC_FRONTEND.md               # RBAC guide
│   ├── components.md                  # Component arch
│   ├── frontend-rbac-implementation.md
│   └── layout-rbac-integration.md
│
├── guides/                            # Development guides
│   ├── api-integration.md
│   ├── contributing.md
│   ├── deployment.md
│   ├── refactoring.md
│   ├── state-management.md
│   ├── styling.md
│   └── testing.md
│
├── testing/                           # Testing docs
│   ├── README.md                      # Testing hub
│   ├── MIGRATION_GUIDE.md
│   ├── guides/                        # Testing guides (6)
│   └── reports/                       # Testing reports (4)
│
├── features/                          # Feature docs
│   ├── ALBUMS_REFACTORING_SUMMARY.md
│   └── STEPS_IMPLEMENTATION_STATUS.md
│
├── refactoring/
│   └── MEDIA_UNIFICATION_REFACTORING.md
│
└── reports/                           # Project reports
    ├── features-audit.md
    ├── 90_PERCENT_COVERAGE_ACHIEVED.md
    ├── FINAL_SESSION_REPORT_611_TESTS.md
    └── TESTING_MILESTONE_ACHIEVED.md
```

**Total**: 20+ documentation files, ~10,000+ lines

---

## 🔧 Development Workflow

### Getting Started

```bash
# 1. Clone & Install
git clone [repository]
cd DKL25AdminPanel
npm install

# 2. Configure Environment
cp .env.example .env
# Edit .env with your settings

# 3. Development
npm run dev          # Start dev server
npm test            # Run tests
npm run lint        # Lint code

# 4. Build
npm run build       # Production build
npm run preview     # Preview build
```

### Development Commands

```bash
# Development
npm run dev              # Dev server (localhost:5173)
npm run build            # Production build
npm run preview          # Preview production

# Testing
npm test                 # Unit/Integration tests
npm run test:ui          # Tests with UI
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests
npm run test:all         # All tests

# Code Quality
npm run lint             # ESLint
npm run type-check       # TypeScript check
```

---

## 📊 Project Metrics

### Code Statistics

| Metric | Value | Details |
|--------|-------|---------|
| **Total Lines** | ~15,000+ | TypeScript + TSX |
| **Components** | 96+ | Shared + Feature |
| **Features** | 16 | Business modules |
| **Pages** | 17 | Route components |
| **Hooks** | 15+ | Custom hooks |
| **API Clients** | 12 | Backend integration |
| **Tests** | 425+ | Unit + Integration |
| **Test Coverage** | 80-85% | Exceeds 75% target |

### Component Distribution

```
Feature Components:  60+ (62%)
Shared Components:   36+ (38%)
  ├── UI:           5  (5%)
  ├── Layout:       7  (7%)
  ├── Auth:         2  (2%)
  ├── Common:       1  (1%)
  └── Typography:   1  (1%)
```

### File Distribution

```
TypeScript Files:  ~350+
Test Files:        ~120+
Documentation:     ~25+
Config Files:      ~10+
```

---

## 🎯 Project Health

### Overall Assessment

| Aspect | Rating | Status |
|--------|--------|--------|
| **Architecture** | ⭐⭐⭐⭐☆ | Good, needs consistency |
| **Code Quality** | ⭐⭐⭐⭐☆ | High, TypeScript strict |
| **Testing** | ⭐⭐⭐⭐☆ | Excellent coverage |
| **Documentation** | ⭐⭐⭐⭐⭐ | Comprehensive |
| **Type Safety** | ⭐⭐⭐⭐⭐ | Full TypeScript |
| **Performance** | ⭐⭐⭐⭐☆ | Good, can optimize |
| **Security** | ⭐⭐⭐⭐☆ | JWT + RBAC |
| **Maintainability** | ⭐⭐⭐⭐☆ | Good structure |

### Strengths ✅

1. **Excellent Test Coverage** (80-85%)
2. **Comprehensive Documentation** (20+ docs)
3. **Strong Type Safety** (Full TypeScript)
4. **Feature-Based Architecture**
5. **Robust RBAC System** (19 resources, 58 permissions)
6. **Modern Tech Stack** (React 18, Vite 6)
7. **Consistent API Layer**
8. **Good Separation of Concerns**

### Areas for Improvement ⚠️

1. **Inconsistent Feature Structure** (needs standardization)
2. **Missing Feature Components** (some features incomplete)
3. **5 Features Need Audit** (unknown structure)
4. **Dashboard Under-developed** (needs expansion)
5. **Some Missing Tests** (E2E tests need expansion)
6. **Documentation Gaps** (some features lack docs)

---

## 🚀 Future Roadmap

### Short Term (Current Sprint)

- ✅ Complete documentation (PROJECT_STRUCTURE, FEATURES_DOCUMENTATION)
- ⬜ Standardize all feature modules
- ⬜ Complete feature audits (5 features)
- ⬜ Reach 90% test coverage

### Medium Term (Next Quarter)

- ⬜ Reorganize Users, Photos, Contact features
- ⬜ Expand Dashboard feature
- ⬜ Complete E2E test suite
- ⬜ Performance optimization
- ⬜ Accessibility audit (WCAG 2.1 AA)

### Long Term (Next Year)

- ⬜ 100% test coverage
- ⬜ Microservices architecture
- ⬜ Advanced monitoring & analytics
- ⬜ Multi-language support
- ⬜ Mobile app integration

---

## 📞 Getting Help

### Documentation Resources

1. **[README.md](../README.md)** - Project overview & quick start
2. **[docs/README.md](README.md)** - Documentation hub
3. **[PROJECT_STRUCTURE.md](architecture/PROJECT_STRUCTURE.md)** - Structure details
4. **[FEATURES_DOCUMENTATION.md](architecture/FEATURES_DOCUMENTATION.md)** - Feature details

### For Specific Topics

| Topic | Document |
|-------|----------|
| Authentication | [`docs/architecture/Auth_system.md`](architecture/Auth_system.md) |
| RBAC | [`docs/architecture/RBAC_FRONTEND.md`](architecture/RBAC_FRONTEND.md) |
| Testing | [`docs/testing/README.md`](testing/README.md) |
| API Integration | [`docs/guides/api-integration.md`](guides/api-integration.md) |
| Styling | [`docs/guides/styling.md`](guides/styling.md) |
| Contributing | [`docs/guides/contributing.md`](guides/contributing.md) |

---

## 📝 Quick Tips

### For New Developers

1. Start with [`README.md`](../README.md)
2. Read [`PROJECT_STRUCTURE.md`](architecture/PROJECT_STRUCTURE.md)
3. Review [`FEATURES_DOCUMENTATION.md`](architecture/FEATURES_DOCUMENTATION.md)
4. Check out example features (Albums, Auth)
5. Run tests: `npm test`

### For Feature Development

1. Follow standard feature template
2. Add tests (target: 80%+)
3. Update documentation
4. Check RBAC requirements
5. Follow TypeScript best practices

### For Bug Fixes

1. Write failing test first
2. Fix the bug
3. Ensure tests pass
4. Update documentation if needed
5. Add to troubleshooting if relevant

---

## 🎓 Learning Resources

### Internal Resources

- [Testing Guide](testing/README.md)
- [Component Architecture](architecture/components.md)
- [State Management Guide](guides/state-management.md)
- [Refactoring Guide](guides/refactoring.md)

### External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-02  
**Next Review**: 2025-12-01  
**Maintained By**: Development Team  

**For questions or suggestions**: Contact development team

---

<p align="center">
  <strong>Built with ❤️ by the DKL25 Development Team</strong><br>
  <a href="https://dekoninklijkeloop.nl">dekoninklijkeloop.nl</a>
</p>