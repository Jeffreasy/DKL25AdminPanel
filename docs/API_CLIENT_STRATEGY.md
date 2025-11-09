# API Client Strategy - DKL25 Admin Panel

Complete gids voor API clients in het DKL25 Admin Panel en migratie van legacy code naar moderne patterns.

## 📋 Overzicht

Het DKL25 Admin Panel heeft **twee type API clients**:

1. **🆕 Modern Clients** - Specifieke, getypeerde clients in `/src/api/client/`
2. **❌ Legacy API** - Monolithisch `api.client.ts` bestand (DEPRECATED)

**Aanbeveling:** Gebruik altijd de moderne clients voor nieuwe code.

---

## 🎯 API Client Architectuur

### Moderne Client Structuur

```
src/api/client/
├── auth.ts              ❌ DEPRECATED - Use AuthProvider + TokenManager
├── notulenClient.ts     ✅ Meeting notes
├── userClient.ts        ✅ User management
├── emailClient.ts       ✅ Email operations
├── albumClient.ts       ✅ Photo albums
├── videoClient.ts       ✅ Video content
├── sponsorClient.ts     ✅ Sponsor management
├── partnerClient.ts     ✅ Partner management
├── contactClient.ts     ✅ Contact messages
├── stepsClient.ts       ✅ Steps tracking
├── rbacClient.ts        ✅ Roles & permissions
├── photos.ts            ✅ Photo management
├── cloudinary.ts        ✅ Image uploads
└── index.ts             ✅ Centralized exports
```

### Legacy Structure (DEPRECATED)

```
src/services/
└── api.client.ts        ❌ Monolithic legacy API (543 LOC)
```

---

## ✅ Moderne Clients - Best Practices

### 1. Import Pattern

```typescript
// ✅ CORRECT - Import from centralized index
import { notulenClient, userClient, emailClient } from '@/api/client';

// ❌ AVOID - Direct file imports (but still works)
import { notulenClient } from '@/api/client/notulenClient';
```

### 2. Client Features

Alle moderne clients bieden:

- ✅ **TypeScript types** - Volledige type safety
- ✅ **Error handling** - Consistente error responses
- ✅ **Token management** - Automatisch via interceptors
- ✅ **Response normalization** - Voorspelbare data structures
- ✅ **JSDoc comments** - IntelliSense support

### 3. Usage Examples

#### Notulen Client

```typescript
import { notulenClient } from '@/api/client';
import type { NotulenCreateRequest } from '@/types/notulen';

// Get all notulen
const notulen = await notulenClient.getAll();

// Get specific notulen
const notuul = await notulenClient.getById(id);

// Create new
const data: NotulenCreateRequest = {
  titel: 'Vergadering',
  datum: '2025-01-08',
  aanwezig: ['John', 'Jane'],
  verslag: 'Meeting notes...'
};
const created = await notulenClient.create(data);

// Update
await notulenClient.update(id, { status: 'definitief' });

// Delete
await notulenClient.delete(id);

// Get versions
const versions = await notulenClient.getVersions(id);
```

#### User Client

```typescript
import { userClient } from '@/api/client';

// Search users
const users = await userClient.search('john');

// Get by ID
const user = await userClient.getById(userId);

// Assign roles
await userClient.assignRole(userId, roleId);
```

#### Email Client

```typescript
import { emailClient } from '@/api/client';
import type { SendEmailParams } from '@/api/client';

// Send email
const params: SendEmailParams = {
  to: 'user@example.com',
  subject: 'Welcome',
  type: 'contact_reply',
  participantId: '123'
};
await emailClient.send(params);

// Send with template
await emailClient.sendTemplate({
  templateId: 'welcome',
  to: 'user@example.com',
  data: { name: 'John' }
});
```

---

## ❌ Legacy API - Wanneer Gebruiken?

**Korte antwoord:** Bijna nooit voor nieuwe code!

### Wanneer Legacy OK Is

1. ✅ **Hotfixes** - Kleine fixes in bestaande legacy code
2. ✅ **Code die soon deprecated wordt** - Niet de moeite waard te migreren
3. ✅ **Backwards compatibility** - Moet support oude API blijven

### Wanneer Migreren

1. 🔴 **Nieuwe features** - Altijd moderne clients
2. 🔴 **Refactoring** - Gebruik kans om te migreren
3. 🔴 **Bug fixes in core logic** - Migreer tijdens fix

---

## 🔄 Migration Guide

### Stap 1: Identificeer Legacy Usage

```typescript
// ❌ LEGACY PATTERN
import { api } from '@/services/api.client';

const fetchData = async () => {
  const data = await api.users.list();
  return data;
};
```

### Stap 2: Find Equivalent Modern Client

| Legacy API | Modern Client | Import |
|------------|---------------|--------|
| `api.auth.*` | `AuthProvider` + `useAuth()` | `@/features/auth/hooks/useAuth` |
| `api.users.*` | `userClient` | `@/api/client` |
| `api.contacts.*` | `contactClient` | `@/api/client` |
| `api.albums.*` | `albumClient` | `@/api/client` |
| `api.photos.*` | `photoApiClient` | `@/api/client` |
| `api.videos.*` | `videoClient` | `@/api/client` |
| `api.sponsors.*` | `sponsorClient` | `@/api/client` |
| `api.newsletter.*` | Legacy only | - |
| `api.steps.*` | `stepsClient` | `@/api/client` |

### Stap 3: Refactor

```typescript
// ✅ MODERN PATTERN
import { userClient } from '@/api/client';

const fetchData = async () => {
  const data = await userClient.getAll();
  return data;
};
```

### Stap 4: Update Types

```typescript
// ❌ LEGACY - No types
const data = await api.users.list();

// ✅ MODERN - Full TypeScript support
import type { User } from '@/api/client';
const data: User[] = await userClient.getAll();
```

---

## 📚 Complete Migration Examples

### Example 1: User Management Page

**VOOR (Legacy):**
```typescript
import { api } from '@/services/api.client';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await api.users.list();
        setUsers(data);
      } catch (error) {
        console.error('Failed:', error);
      }
    };
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    await api.users.delete(id);
    // Reload...
  };

  return <div>{/* ... */}</div>;
}
```

**NA (Modern):**
```typescript
import { userClient } from '@/api/client';
import type { User } from '@/api/client';

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userClient.getAll();
        setUsers(data);
      } catch (error) {
        console.error('Failed:', error);
      }
    };
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    await userClient.delete(id);
    // Reload...
  };

  return <div>{/* ... */}</div>;
}
```

### Example 2: Authentication

**VOOR (Legacy - authManager):**
```typescript
import { authManager } from '@/api/client/auth';

function LoginForm() {
  const handleLogin = async (email: string, password: string) => {
    const result = await authManager.login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return <form>{/* ... */}</form>;
}
```

**NA (Modern - AuthProvider):**
```typescript
import { useAuth } from '@/features/auth/hooks/useAuth';

function LoginForm() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <form>{/* ... */}</form>;
}
```

### Example 3: File Upload

**VOOR (Legacy):**
```typescript
import { uploadService } from '@/services/upload.service';

const handleUpload = async (file: File) => {
  const url = await uploadService.uploadImage(file, 'albums');
  return url;
};
```

**NA (Modern):**
```typescript
import { ImageUploadClient } from '@/api/client';

const uploadClient = new ImageUploadClient();

const handleUpload = async (file: File) => {
  const result = await uploadClient.upload(file, 'albums');
  return result.url;
};
```

---

## 🏗️ Creating New Clients

### Template for New Client

```typescript
// src/api/client/exampleClient.ts
import { authManager } from './auth';

interface Example {
  id: string;
  name: string;
  // ... other fields
}

interface ExampleCreateData {
  name: string;
  // ... required fields
}

interface ExampleUpdateData {
  name?: string;
  // ... optional fields
}

/**
 * Example Client - Manage example resources
 * 
 * @example
 * ```typescript
 * import { exampleClient } from '@/api/client';
 * 
 * const items = await exampleClient.getAll();
 * const item = await exampleClient.getById(id);
 * ```
 */
export const exampleClient = {
  /**
   * Get all examples
   */
  async getAll(): Promise<Example[]> {
    const response = await authManager.makeAuthenticatedRequest('/api/examples', {
      method: 'GET'
    });
    return response as Example[];
  },

  /**
   * Get example by ID
   */
  async getById(id: string): Promise<Example> {
    const response = await authManager.makeAuthenticatedRequest(`/api/examples/${id}`, {
      method: 'GET'
    });
    return response as Example;
  },

  /**
   * Create new example
   */
  async create(data: ExampleCreateData): Promise<Example> {
    const response = await authManager.makeAuthenticatedRequest('/api/examples', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response as Example;
  },

  /**
   * Update example
   */
  async update(id: string, data: ExampleUpdateData): Promise<Example> {
    const response = await authManager.makeAuthenticatedRequest(`/api/examples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response as Example;
  },

  /**
   * Delete example
   */
  async delete(id: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/examples/${id}`, {
      method: 'DELETE'
    });
  }
};
```

### Add to Central Export

```typescript
// src/api/client/index.ts

// Add import
export { exampleClient } from './exampleClient';
export type { Example, ExampleCreateData, ExampleUpdateData } from './exampleClient';
```

---

## 🧪 Testing Strategy

### Unit Testing Modern Clients

```typescript
// src/api/client/__tests__/exampleClient.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exampleClient } from '../exampleClient';
import { authManager } from '../auth';

// Mock authManager
vi.mock('../auth', () => ({
  authManager: {
    makeAuthenticatedRequest: vi.fn()
  }
}));

describe('exampleClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all examples', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(mockData);

    const result = await exampleClient.getAll();

    expect(result).toEqual(mockData);
    expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith(
      '/api/examples',
      { method: 'GET' }
    );
  });

  it('should handle errors', async () => {
    vi.mocked(authManager.makeAuthenticatedRequest).mockRejectedValue(
      new Error('API Error')
    );

    await expect(exampleClient.getAll()).rejects.toThrow('API Error');
  });
});
```

---

## 📊 Migration Progress Tracker

### Current Status

| Feature | Status | Client | Priority |
|---------|--------|--------|----------|
| Authentication | ✅ Migrated | `AuthProvider` | - |
| User Management | ✅ Modern | `userClient` | - |
| Notulen | ✅ Modern | `notulenClient` | - |
| Email | ✅ Modern | `emailClient` | - |
| Albums | ✅ Modern | `albumClient` | - |
| Videos | ✅ Modern | `videoClient` | - |
| Photos | ✅ Modern | `photoApiClient` | - |
| Sponsors | ✅ Modern | `sponsorClient` | - |
| Partners | ✅ Modern | `partnerClient` | - |
| Contact | ✅ Modern | `contactClient` | - |
| Steps | ✅ Modern | `stepsClient` | - |
| RBAC | ✅ Modern | `rbacClient` | - |
| Newsletter | ⏳ Legacy | - | High |
| Registrations | ⏳ Legacy | - | Medium |
| Routes/Funds | ⏳ Legacy | - | Low |

### Migration Phases

#### Phase 1: High Priority (Next Sprint) ✅
- [x] Mark legacy code as deprecated
- [x] Document modern clients
- [x] Create migration guide

#### Phase 2: Critical Features (Q1 2025)
- [ ] Newsletter client
- [ ] Registration client
- [ ] Update all pages using legacy API

#### Phase 3: Full Cleanup (Q2 2025)
- [ ] Remove `api.client.ts` completely
- [ ] Remove `authManager` class
- [ ] 100% modern client coverage

---

## 🎯 Decision Matrix

### When to Use What?

```
┌───────────────────────────────────────────────────────────┐
│                    DECISION TREE                          │
└───────────────────────────────────────────────────────────┘

Starting a NEW feature?
    │
    ├─► YES ──► Use Modern Clients ✅
    │           (userClient, notulenClient, etc.)
    │
    └─► NO
        │
        Fixing a BUG in existing code?
            │
            ├─► SMALL FIX ──► Keep Legacy OK ⚠️
            │                 (Quick hotfix)
            │
            └─► MAJOR REFACTOR ──► Migrate to Modern ✅
                                   (Good opportunity)

Need Authentication?
    │
    ├─► Token Management ──► TokenManager ✅
    ├─► React Context ──► useAuth() hook ✅
    └─► API Calls ──► Modern clients ✅
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Import errors after migration

```typescript
// ❌ Problem
import { userClient } from '@/api/client/userClient';
// Error: Module not found

// ✅ Solution
import { userClient } from '@/api/client';
```

#### Issue: Type errors

```typescript
// ❌ Problem
const users = await userClient.getAll();
users[0].unknown // Type error

// ✅ Solution
import type { User } from '@/api/client';
const users: User[] = await userClient.getAll();
users[0].id // ✅ Works
```

#### Issue: Authentication errors

```typescript
// ❌ Problem - Direct API call without auth
fetch('/api/users');

// ✅ Solution - Use client with automatic auth
import { userClient } from '@/api/client';
userClient.getAll(); // Token added automatically
```

---

## 📚 Additional Resources

### Documentation
- [`TOKEN_MANAGEMENT.md`](TOKEN_MANAGEMENT.md) - Token handling guide
- [`FRONTEND_INTEGRATION.md`](../FRONTEND_INTEGRATION.md) - API integration patterns
- [`QUICK_REFERENCE.md`](../QUICK_REFERENCE.md) - API endpoint reference

### Code Examples
- `/src/api/client/` - Modern client implementations
- `/src/api/client/__tests__/` - Client test examples
- `/src/pages/` - Real-world usage examples

---

## ✅ Checklist for New Features

When building a new feature:

- [ ] Check if modern client exists for your resource
- [ ] If not, create new client following template
- [ ] Add TypeScript types
- [ ] Write unit tests
- [ ] Add to central `/src/api/client/index.ts`
- [ ] Document usage in JSDoc comments
- [ ] Update this strategy doc if needed
- [ ] DO NOT use legacy `api.client.ts`

---

**Version:** 1.0  
**Last Updated:** 2025-01-08  
**Status:** ✅ Active Documentation

**Maintained By:** Development Team  
**Questions?** Check examples in `/src/api/client/` or create an issue.