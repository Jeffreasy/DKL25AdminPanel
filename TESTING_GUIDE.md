# 🧪 Testing Guide - DKL25 Admin Panel

## Overzicht

Dit document beschrijft de testing infrastructure en best practices voor het DKL25 Admin Panel project.

---

## 📦 Testing Stack

### **Core Libraries**:
- **Vitest**: Fast unit test framework (Vite-native)
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom matchers

---

## 🚀 Getting Started

### **Installation**:
```bash
npm install
```

### **Run Tests**:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## 📁 Test Structure

```
src/
├── test/
│   ├── setup.ts           # Global test setup
│   └── utils.tsx          # Custom render utilities
├── components/
│   └── ui/
│       ├── ConfirmDialog.tsx
│       └── __tests__/
│           ├── ConfirmDialog.test.tsx
│           ├── EmptyState.test.tsx
│           └── LoadingGrid.test.tsx
└── features/
    └── photos/
        ├── services/
        │   └── __tests__/
        │       └── photoService.test.ts
        └── components/
            └── __tests__/
                └── PhotoGrid.test.tsx
```

---

## 🧩 Test Utilities

### **Custom Render**:
```typescript
import { render, screen } from '@/test/utils'

// Automatically wraps with:
// - QueryClientProvider
// - BrowserRouter
// - Other providers as needed

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

---

## 📝 Writing Tests

### **UI Component Tests**:

#### **Example: ConfirmDialog**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Item"
        message="Are you sure?"
      />
    )

    expect(screen.getByText('Delete Item')).toBeInTheDocument()
  })

  it('calls onConfirm when confirmed', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Test"
        message="Test"
      />
    )

    screen.getByText('Bevestigen').click()
    expect(onConfirm).toHaveBeenCalled()
  })
})
```

### **Service Tests**:

#### **Example: photoService**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { photoService } from '../photoService'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }
}))

describe('photoService', () => {
  it('fetches photos successfully', async () => {
    const result = await photoService.getPhotos()
    expect(result.data).toBeDefined()
  })
})
```

---

## 🎯 Testing Best Practices

### **1. Test User Behavior, Not Implementation**
✅ **GOED**:
```typescript
// Test what user sees/does
expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
screen.getByRole('button', { name: /delete/i }).click()
```

❌ **VERMIJD**:
```typescript
// Don't test implementation details
expect(component.state.isOpen).toBe(true)
```

### **2. Use Semantic Queries**
Prioriteit (van hoog naar laag):
1. `getByRole` - Meest accessible
2. `getByLabelText` - Voor form elements
3. `getByPlaceholderText` - Voor inputs
4. `getByText` - Voor content
5. `getByTestId` - Laatste optie

### **3. Test Accessibility**
```typescript
// Check ARIA attributes
expect(button).toHaveAttribute('aria-label', 'Close dialog')

// Check keyboard navigation
fireEvent.keyDown(dialog, { key: 'Escape' })
expect(onClose).toHaveBeenCalled()
```

### **4. Mock External Dependencies**
```typescript
// Mock Supabase
vi.mock('@/lib/supabase')

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))
```

---

## 📊 Coverage Goals

### **Target Coverage**:
- **UI Components**: 80%+ coverage
- **Services**: 70%+ coverage
- **Utilities**: 90%+ coverage
- **Overall**: 75%+ coverage

### **Check Coverage**:
```bash
npm run test:coverage
```

Coverage report wordt gegenereerd in `coverage/` directory.

---

## 🧪 Test Examples

### **Voorbeeldtests Beschikbaar**:
1. ✅ [`ConfirmDialog.test.tsx`](src/components/ui/__tests__/ConfirmDialog.test.tsx) - Dialog component tests
2. ✅ [`EmptyState.test.tsx`](src/components/ui/__tests__/EmptyState.test.tsx) - Empty state tests
3. ✅ [`LoadingGrid.test.tsx`](src/components/ui/__tests__/LoadingGrid.test.tsx) - Loading grid tests

---

## 🎯 Testing Checklist

Bij het schrijven van nieuwe features:

- [ ] Write unit tests voor nieuwe components
- [ ] Write integration tests voor nieuwe features
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test error states
- [ ] Test loading states
- [ ] Test empty states
- [ ] Verify accessibility (ARIA labels)
- [ ] Check coverage report
- [ ] Update tests bij refactoring

---

## 🔧 Configuration

### **Vitest Config** ([`vitest.config.ts`](vitest.config.ts)):
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### **Test Setup** ([`src/test/setup.ts`](src/test/setup.ts)):
- Cleanup after each test
- Mock window.matchMedia
- Mock IntersectionObserver
- Import @testing-library/jest-dom

---

## 📚 Resources

### **Documentation**:
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### **Example Tests**:
- UI Components: `src/components/ui/__tests__/`
- Services: `src/features/*/services/__tests__/`
- Integration: `src/features/*/__tests__/`

---

**Laatst bijgewerkt**: 2025-10-08
**Versie**: 1.0.0 - Testing Infrastructure Setup