# 🧪 Testing Guide

> **Versie:** 1.0 | **Status:** Complete | **Laatste Update:** 2025-01-08

Complete testing infrastructure en best practices.

---

## 📋 Inhoudsopgave

- [Overzicht](#-overzicht)
- [Testing Stack](#-testing-stack)
- [Getting Started](#-getting-started)
- [Writing Tests](#-writing-tests)
- [Best Practices](#-best-practices)
- [Coverage Goals](#-coverage-goals)

---

## 🎯 Overzicht

Moderne testing stack met Vitest en React Testing Library voor snelle, betrouwbare tests.

### Testing Philosophy

- ✅ Test user behavior, niet implementation
- ✅ Use semantic queries voor accessibility
- ✅ Mock external dependencies
- ✅ Aim for 75%+ coverage

---

## 📦 Testing Stack

| Library | Doel |
|---------|------|
| **Vitest** | Fast unit test framework |
| **React Testing Library** | Component testing |
| **@testing-library/user-event** | User interaction simulation |
| **@testing-library/jest-dom** | Custom matchers |

---

## 🚀 Getting Started

### Run Tests

```bash
npm test                # Run all tests
npm test -- --watch     # Watch mode
npm run test:ui         # With UI
npm run test:coverage   # With coverage
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

| Category | Target | Status |
|----------|--------|--------|
| **UI Components** | 80%+ | ✅ |
| **Services** | 70%+ | 🔄 |
| **Overall** | 75%+ | 🔄 |

---

## 📚 Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- Example tests: [`src/components/ui/__tests__/`](../../src/components/ui/__tests__/)

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Coverage Target:** 75%+