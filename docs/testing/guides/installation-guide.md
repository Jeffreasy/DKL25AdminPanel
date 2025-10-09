# 🛠️ Testing Setup Guide

> **Versie:** 1.0 | **Status:** Complete | **Laatste Update:** 2025-01-08

Step-by-step guide to set up the complete testing infrastructure.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

---

## 🚀 Quick Start

### 1. Install MSW (Mock Service Worker)

```bash
npm install --save-dev msw@latest
```

### 2. Enable MSW in Test Setup

Edit [`src/test/setup.ts`](../../src/test/setup.ts) and uncomment the MSW lines:

```typescript
// Remove the comment markers from these lines:
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### 3. Install Additional Testing Dependencies (Optional)

```bash
# For E2E testing
npm install --save-dev @playwright/test

# For visual regression testing
npm install --save-dev @storybook/test-runner
```

### 4. Verify Installation

```bash
# Run existing tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

---

## 📦 Package Installation Details

### Core Testing Packages (Already Installed ✅)

```json
{
  "devDependencies": {
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "jsdom": "^23.0.1"
  }
}
```

### Additional Packages to Install

```bash
# MSW for API mocking
npm install --save-dev msw@latest

# Playwright for E2E testing
npm install --save-dev @playwright/test

# Coverage tools
npm install --save-dev @vitest/coverage-v8
```

---

## 🔧 Configuration

### Vitest Config

The project already has Vitest configured in [`vite.config.ts`](../../vite.config.ts). Verify it includes:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}'
      ]
    }
  }
})
```

### TypeScript Config

Ensure [`tsconfig.json`](../../tsconfig.json) includes test types:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

---

## 📁 File Structure

After setup, your test structure should look like:

```
src/
├── test/
│   ├── setup.ts                 # Test setup & global mocks
│   ├── utils.tsx                # Custom render & mock factories
│   ├── vitest.d.ts             # Type definitions
│   └── mocks/
│       ├── handlers.ts          # MSW request handlers
│       └── server.ts            # MSW server setup
├── components/
│   └── ui/
│       └── __tests__/           # Component tests
│           ├── ConfirmDialog.test.tsx
│           ├── EmptyState.test.tsx
│           └── LoadingGrid.test.tsx
└── features/
    └── [feature]/
        ├── components/
        │   └── __tests__/       # Feature component tests
        ├── services/
        │   └── __tests__/       # Service tests
        └── hooks/
            └── __tests__/       # Hook tests
```

---

## 🧪 Writing Your First Test

### 1. Component Test Example

Create `src/components/ui/__tests__/Modal.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    )
    
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls onClose when clicking backdrop', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    )
    
    const backdrop = screen.getByTestId('modal-backdrop')
    await user.click(backdrop)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

### 2. Service Test Example

Create `src/lib/services/__tests__/createCRUDService.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCRUDService } from '../createCRUDService'
import { supabase } from '@/api/client/supabase'

vi.mock('@/api/client/supabase')

describe('createCRUDService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches all items', async () => {
    const mockData = [{ id: '1', name: 'Test' }]
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockData, error: null })
    } as any)

    const service = createCRUDService({ tableName: 'test_table' })
    const result = await service.fetchAll()
    
    expect(result).toEqual(mockData)
    expect(supabase.from).toHaveBeenCalledWith('test_table')
  })
})
```

### 3. Hook Test Example

Create `src/hooks/__tests__/useLocalStorage.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  it('returns initial value', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    )
    
    expect(result.current[0]).toBe('initial')
  })

  it('updates value', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    )
    
    act(() => {
      result.current[1]('updated')
    })
    
    expect(result.current[0]).toBe('updated')
  })
})
```

---

## 🎯 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific file
npm test -- Modal.test.tsx

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Advanced Options

```bash
# Run tests matching pattern
npm test -- --grep="Modal"

# Run only changed tests
npm test -- --changed

# Run with specific reporter
npm test -- --reporter=verbose

# Update snapshots
npm test -- -u
```

---

## 📊 Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

### View Coverage Report

```bash
# Open HTML report
open coverage/index.html

# Or on Windows
start coverage/index.html
```

### Coverage Thresholds

The project aims for:
- **Overall:** 75%+
- **Critical paths:** 90%+
- **UI Components:** 80%+
- **Services:** 70%+

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MSW Not Working

**Problem:** API calls not being intercepted

**Solution:**
```bash
# Ensure MSW is installed
npm install --save-dev msw@latest

# Verify setup.ts has MSW enabled
# Check that server.listen() is called in beforeAll
```

#### 2. Tests Timing Out

**Problem:** Tests hang or timeout

**Solution:**
```typescript
// Increase timeout in specific test
it('slow test', async () => {
  // test code
}, 10000) // 10 second timeout

// Or globally in vite.config.ts
test: {
  testTimeout: 10000
}
```

#### 3. Module Not Found

**Problem:** Cannot find module '@/...'

**Solution:**
```typescript
// Verify tsconfig.json has path mapping
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// Verify vite.config.ts has alias
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

#### 4. React Testing Library Errors

**Problem:** "Unable to find element"

**Solution:**
```typescript
// Use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Use findBy queries (built-in waitFor)
const element = await screen.findByText('Loaded')
```

---

## 🔄 CI/CD Integration

### GitHub Actions

The project includes a GitHub Actions workflow at [`.github/workflows/test.yml`](../../.github/workflows/test.yml).

It will:
- ✅ Run on push to main/develop
- ✅ Run on pull requests
- ✅ Test on Node 18 and 20
- ✅ Run linter
- ✅ Run type check
- ✅ Run tests with coverage
- ✅ Upload coverage to Codecov
- ✅ Check coverage threshold

### Local Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm test -- --run
```

---

## 📚 Additional Resources

### Documentation
- [Comprehensive Testing Plan](./COMPREHENSIVE_TESTING_PLAN.md)
- [Testing Guide](./testing.md)
- [Components Reference](../architecture/components.md)

### External Links
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `npm test` runs successfully
- [ ] Coverage report generates
- [ ] MSW intercepts API calls
- [ ] All existing tests pass
- [ ] CI/CD workflow runs on push
- [ ] Test utilities work correctly
- [ ] Mock factories available

---

## 🎯 Next Steps

1. ✅ Complete this setup guide
2. ⚪ Write tests for Modal component
3. ⚪ Write tests for DataTable component
4. ⚪ Write tests for core services
5. ⚪ Achieve 30% coverage milestone

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Status:** Complete  
**Maintainer:** Development Team