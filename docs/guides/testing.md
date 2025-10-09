# 🧪 Testing Guide

> **Versie:** 2.0 | **Status:** Complete | **Laatste Update:** 2025-01-08

Complete testing infrastructure en best practices.

---

## 🆕 Nieuwe Testing Documentatie

Voor uitgebreide testing informatie, zie:

- 📋 **[Comprehensive Testing Plan](./COMPREHENSIVE_TESTING_PLAN.md)** - Complete 12-week strategie naar 75%+ coverage
- 🛠️ **[Testing Setup Guide](./TESTING_SETUP_GUIDE.md)** - Step-by-step setup instructies met voorbeelden
- 📊 **[Testing Implementation Summary](./TESTING_IMPLEMENTATION_SUMMARY.md)** - Current status en next steps

---

## 📋 Inhoudsopgave

- [Overzicht](#-overzicht)
- [Testing Stack](#-testing-stack)
- [Getting Started](#-getting-started)
- [Writing Tests](#-writing-tests)
- [Best Practices](#-best-practices)
- [Coverage Goals](#-coverage-goals)
- [Nieuwe Resources](#-nieuwe-resources)

---

## 🎯 Overzicht

Moderne testing stack met Vitest en React Testing Library voor snelle, betrouwbare tests.

### 🆕 Testing Infrastructure Update

Het project heeft nu een complete testing infrastructure met:
- ✅ Enhanced test utilities met mock factories
- ✅ MSW (Mock Service Worker) voor API mocking
- ✅ CI/CD pipeline met automated testing
- ✅ Comprehensive testing plan (12-week roadmap)
- ✅ Example tests en templates

### Testing Philosophy

- ✅ Test user behavior, niet implementation
- ✅ Use semantic queries voor accessibility
- ✅ Mock external dependencies
- ✅ Aim for 75%+ coverage
- 🆕 Use mock factories voor consistent test data
- 🆕 MSW voor API mocking

---

## 📦 Testing Stack

| Library | Doel |
|---------|------|
| **Vitest** | Fast unit test framework |
| **React Testing Library** | Component testing |
| **@testing-library/user-event** | User interaction simulation |
| **@testing-library/jest-dom** | Custom matchers |
| **MSW** | 🆕 API mocking (to be installed) |

---

## 🚀 Getting Started

### Run Tests

```bash
npm test                # Run all tests
npm test -- --watch     # Watch mode
npm run test:ui         # With UI
npm run test:coverage   # With coverage
```

### 🆕 Setup New Infrastructure

Voor complete setup instructies, zie [Testing Setup Guide](./TESTING_SETUP_GUIDE.md).

Quick start:
```bash
# Install MSW
npm install --save-dev msw@latest

# Run tests
npm test
```

---

## 📝 Writing Tests

### UI Component Test

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        message="Are you sure?"
      />
    )
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })
})
```

🆕 **Voor meer uitgebreide voorbeelden**, zie:
- [Modal Test Example](../../src/components/ui/__tests__/Modal.test.tsx) - 267 lines comprehensive test
- [Testing Setup Guide](./TESTING_SETUP_GUIDE.md) - Component, service, en hook test voorbeelden

### Service Test

```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/api/client/supabase')

describe('photoService', () => {
  it('fetches photos', async () => {
    const result = await photoService.getPhotos()
    expect(result.data).toBeDefined()
  })
})
```

🆕 **Met mock factories:**
```typescript
import { mockPhoto } from '@/test/utils'

describe('photoService', () => {
  it('fetches photos', async () => {
    const mockData = [mockPhoto(), mockPhoto({ id: '2' })]
    // ... test implementation
  })
})
```

---

## 🎯 Best Practices

### 1. Test User Behavior

✅ **GOED:**
```typescript
await user.click(screen.getByRole('button', { name: /delete/i }))
```

❌ **VERMIJD:**
```typescript
expect(component.state.isOpen).toBe(true)
```

### 2. Semantic Queries

**Prioriteit:**
1. `getByRole` - Meest accessible
2. `getByLabelText` - Voor forms
3. `getByText` - Voor content
4. `getByTestId` - Laatste optie

### 3. Mock Dependencies

```typescript
vi.mock('@/api/client/supabase')
vi.mock('react-router-dom')
```

---

## 📊 Coverage Goals

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| **UI Components** | ~3% | 80%+ | 🔄 In Progress |
| **Services** | 0% | 70%+ | ⚪ Planned |
| **Hooks** | 0% | 75%+ | ⚪ Planned |
| **Utils** | 0% | 85%+ | ⚪ Planned |
| **Auth System** | 0% | 90%+ | ⚪ Planned |
| **Overall** | ~15% | 75%+ | 🔄 In Progress |

🆕 **Voor detailed roadmap**, zie [Comprehensive Testing Plan](./COMPREHENSIVE_TESTING_PLAN.md).

---

## 📚 Resources

### Internal Documentation
- 🆕 **[Comprehensive Testing Plan](./COMPREHENSIVE_TESTING_PLAN.md)** - Complete strategie
- 🆕 **[Testing Setup Guide](./TESTING_SETUP_GUIDE.md)** - Setup instructies
- 🆕 **[Testing Implementation Summary](./TESTING_IMPLEMENTATION_SUMMARY.md)** - Status tracking

### Example Tests
- 🆕 [Modal Test](../../src/components/ui/__tests__/Modal.test.tsx) - Comprehensive example (267 lines)
- [ConfirmDialog Test](../../src/components/ui/__tests__/ConfirmDialog.test.tsx)
- [EmptyState Test](../../src/components/ui/__tests__/EmptyState.test.tsx)
- [LoadingGrid Test](../../src/components/ui/__tests__/LoadingGrid.test.tsx)

### Test Utilities
- 🆕 [Enhanced Test Utils](../../src/test/utils.tsx) - Mock factories & helpers
- 🆕 [MSW Handlers](../../src/test/mocks/handlers.ts) - API mocking
- [Test Setup](../../src/test/setup.ts) - Global configuration

### External Resources
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🆕 Nieuwe Resources

### Testing Infrastructure
- ✅ Mock data factories voor alle entities
- ✅ MSW handlers voor API endpoints
- ✅ CI/CD pipeline met automated testing
- ✅ Coverage reporting en thresholds

### Documentation
- ✅ 12-week implementation roadmap
- ✅ Test templates en specifications
- ✅ Best practices guide
- ✅ Troubleshooting guide

### Next Steps
1. Install MSW: `npm install --save-dev msw@latest`
2. Review [Testing Setup Guide](./TESTING_SETUP_GUIDE.md)
3. Check [Comprehensive Testing Plan](./COMPREHENSIVE_TESTING_PLAN.md)
4. Start writing tests using provided templates

---

**Versie:** 2.0
**Laatste Update:** 2025-01-08
**Coverage Target:** 75%+
**Status:** Infrastructure Complete, Implementation Starting