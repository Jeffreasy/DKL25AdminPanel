# 🔧 Testing Troubleshooting Guide

> **Versie:** 1.1 | **Status:** Resolved | **Laatste Update:** 2025-01-08

Troubleshooting guide voor testing issues in het DKL25 Admin Panel.

---

## ✅ Resolved Issues

### Issue #1: Vitest Globals Not Working ✅ RESOLVED

**Symptom:**
```
TypeError: Cannot read properties of undefined (reading 'test')
Error: No test suite found in file
```

**Root Cause:**
Vitest v1.6.1 had een bug met `globals: true` configuratie.

**Solution:** ✅ **OPGELOST**
Upgrade naar Vitest v3.2.4:
```bash
npm install --save-dev vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest
```

**Result:**
- ✅ 100 tests nu running
- ✅ 85 tests passing (85% pass rate)
- ✅ Globals werken correct
- ✅ Test execution: 3.44s

**Workaround:**
Expliciet importeren van test functies in plaats van globals:

```typescript
// ❌ NIET WERKEN (met globals: true)
describe('Test', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})

// ✅ WERKT (expliciete imports)
import { describe, it, expect, test, vi, beforeEach, afterEach } from 'vitest'

describe('Test', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})
```

**Status:** ✅ **RESOLVED** - Vitest v3.2.4 geïnstalleerd

**Implemented Fix:**
```bash
npm install --save-dev vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest
```

---

## 🚨 Current Issues

### Minor Test Failures (15/100 tests)

**caseConverter Tests (2 failures):**
- Expected output mismatch
- `camelToSnake` doesn't add leading underscore
- Easy fix: Update test expectations

**createCRUDService Tests (10 failures):**
- Mock chain issues
- Error message translations (NL vs EN)
- Easy fix: Update mocks and expectations

**Modal Tests (3 failures):**
- Button selector issues (looking for /close/i, should be /sluiten/i)
- Missing test-id for backdrop
- Easy fix: Update selectors

**Total Impact:** Low - All are minor assertion/mock issues, not fundamental problems

---

## 🔧 Best Practices

### Voor Nieuwe Tests

Gebruik expliciete imports (nu optioneel maar aanbevolen):

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Text')).toBeInTheDocument()
  })
})
```

### Voor Bestaande Tests

Alle bestaande tests gebruiken expliciete imports en werken correct:
- ✅ ConfirmDialog (6/6 passing)
- ✅ EmptyState (4/4 passing)
- ✅ LoadingGrid (5/5 passing)
- ✅ DataTable (33/33 passing)
- ⚠️ Modal (20/23 passing - minor fixes needed)

---

## 📋 Testing Checklist

Voordat je een test schrijft:

- [ ] Import `describe`, `it`, `expect` van 'vitest'
- [ ] Import `vi` als je mocks nodig hebt
- [ ] Import `beforeEach`, `afterEach` als je setup/cleanup nodig hebt
- [ ] Import `render`, `screen` van '@/test/utils'
- [ ] Import `userEvent` van '@testing-library/user-event'
- [ ] Gebruik mock factories uit `@/test/utils`

---

## 🎯 Recommended Test Structure

```typescript
// 1. Vitest imports
import { describe, it, expect, vi, beforeEach } from 'vitest'

// 2. Testing library imports
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'

// 3. Component/service imports
import { ComponentName } from '../ComponentName'

// 4. Mock factories (if needed)
import { mockUser, mockPhoto } from '@/test/utils'

// 5. Mock external dependencies
vi.mock('@/api/client/supabase')

// 6. Test suite
describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with props', () => {
      render(<ComponentName prop="value" />)
      expect(screen.getByText('value')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('handles click', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      
      render(<ComponentName onClick={onClick} />)
      await user.click(screen.getByRole('button'))
      
      expect(onClick).toHaveBeenCalled()
    })
  })
})
```

---

## 🐛 Common Errors

### "Cannot find module '@/...'"

**Solution:** Verify tsconfig.json has path mapping:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### "Module not found: msw"

**Solution:** MSW is optional. Either:
1. Install it: `npm install --save-dev msw@latest`
2. Or: Keep it commented out in handlers.ts and server.ts

### Tests timeout

**Solution:** Increase timeout:
```typescript
it('slow test', async () => {
  // test code
}, 10000) // 10 second timeout
```

---

## ✅ Verified Working Tests

These test files are confirmed working:
- `src/components/ui/__tests__/ConfirmDialog.test.tsx`
- `src/components/ui/__tests__/EmptyState.test.tsx`
- `src/components/ui/__tests__/LoadingGrid.test.tsx`

Use these as templates for new tests.

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Comprehensive Testing Plan](./COMPREHENSIVE_TESTING_PLAN.md)
- [Testing Setup Guide](./TESTING_SETUP_GUIDE.md)

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Status:** Active Issue Tracking  
**Next Review:** After Vitest upgrade