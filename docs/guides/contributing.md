# 🤝 Contributing Guide

> **Versie:** 1.0 | **Status:** Complete | **Laatste Update:** 2025-01-08

Guide voor het bijdragen aan het DKL25 Admin Panel project.

---

## 📋 Inhoudsopgave

- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Coding Standards](#-coding-standards)
- [Pull Request Process](#-pull-request-process)
- [Code Review](#-code-review)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

```bash
# 1. Fork en clone repository
git clone https://github.com/your-username/DKL25AdminPanel.git
cd DKL25AdminPanel

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Vul environment variables in

# 4. Start development server
npm run dev

# 5. Run tests
npm test
```

---

## 🔄 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# of
git checkout -b fix/bug-description
```

**Branch Naming:**
- `feature/` - Nieuwe features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions

### 2. Make Changes

**Checklist:**
- [ ] Follow [Coding Standards](#coding-standards)
- [ ] Write/update tests
- [ ] Update documentation
- [ ] Test in browser
- [ ] Check TypeScript errors
- [ ] Run linter

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add photo bulk upload feature"
```

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - Nieuwe feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Tests
- `style` - Styling/formatting
- `chore` - Maintenance

**Examples:**
```bash
git commit -m "feat(photos): add bulk upload functionality"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "docs: update API integration guide"
```

### 4. Push Changes

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR template
5. Request review

---

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ GOED - Strict typing
interface Photo {
  id: string
  title: string
  url: string
}

function getPhoto(id: string): Promise<Photo> {
  // Implementation
}

// ❌ VERMIJD - Any types
function getPhoto(id: any): any {
  // Implementation
}
```

### Component Structure

```typescript
// ✅ GOED - Proper structure
import { useState } from 'react'
import type { Photo } from '../types'

interface PhotoCardProps {
  photo: Photo
  onUpdate: () => void
}

export function PhotoCard({ photo, onUpdate }: PhotoCardProps) {
  const [loading, setLoading] = useState(false)
  
  return (
    <div className={cc.card()}>
      {/* Component content */}
    </div>
  )
}
```

### File Organization

```typescript
// ✅ GOED - Grouped imports
// 1. React imports
import { useState, useEffect } from 'react'

// 2. Third-party imports
import { useQuery } from '@tanstack/react-query'

// 3. Internal imports
import { useAuth } from '@/features/auth'
import { photoService } from '../services/photoService'
import type { Photo } from '../types'

// 4. Styles
import { cc } from '@/styles/shared'
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `PhotoCard.tsx` |
| **Hooks** | camelCase with 'use' | `usePhotos.ts` |
| **Services** | camelCase with 'Service' | `photoService.ts` |
| **Types** | PascalCase | `Photo`, `PhotoFormData` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| **Functions** | camelCase | `handleSubmit`, `fetchPhotos` |

---

## 🔍 Pull Request Process

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### PR Requirements

- [ ] **Tests** - All tests passing
- [ ] **Build** - No build errors
- [ ] **Linter** - No linting errors
- [ ] **Documentation** - Updated if needed
- [ ] **Screenshots** - For UI changes
- [ ] **Breaking Changes** - Documented

---

## 👀 Code Review

### Review Checklist

**Functionality:**
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling present

**Code Quality:**
- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Proper TypeScript types
- [ ] Comments where needed

**Testing:**
- [ ] Tests cover new code
- [ ] Tests are meaningful
- [ ] All tests pass

**Documentation:**
- [ ] README updated if needed
- [ ] API docs updated
- [ ] Comments clear

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Efficient algorithms
- [ ] Proper memoization

**Security:**
- [ ] No security vulnerabilities
- [ ] Input validation
- [ ] Proper authentication checks

---

## 🎯 Best Practices

### 1. Small, Focused PRs

✅ **GOED:**
- One feature per PR
- Clear scope
- Easy to review

❌ **VERMIJD:**
- Multiple unrelated changes
- Massive PRs (>500 lines)

### 2. Write Tests

✅ **GOED:**
```typescript
describe('PhotoCard', () => {
  it('renders photo title', () => {
    render(<PhotoCard photo={mockPhoto} />)
    expect(screen.getByText(mockPhoto.title)).toBeInTheDocument()
  })
})
```

### 3. Update Documentation

✅ **GOED:**
- Update relevant .md files
- Add code examples
- Update API docs

### 4. Follow Conventions

✅ **GOED:**
- Use existing patterns
- Follow folder structure
- Use shared utilities

---

## 📚 Resources

### Documentation
- [Refactoring Guide](refactoring.md)
- [Styling Guide](styling.md)
- [Testing Guide](testing.md)

### Code Examples
- [`src/features/`](../../src/features/) - Feature examples
- [`src/components/ui/`](../../src/components/ui/) - UI component examples

---

## ❓ Questions?

- Check [Documentation Index](../README.md)
- Open an issue on GitHub
- Contact: info@dekoninklijkeloop.nl

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Status:** Complete