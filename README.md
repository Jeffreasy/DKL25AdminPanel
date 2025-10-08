# DKL25 Admin Panel

> **Versie:** 2.0.0 | **Status:** Production Ready | **Laatste Update:** 2025-01-08

Een professioneel administratief dashboard voor het beheer van De Keukenhof Loop 25 (DKL25) hardloopevenement.

---

## 📋 Inhoudsopgave

- [Overzicht](#-overzicht)
- [Technische Stack](#-technische-stack)
- [Projectstructuur](#-projectstructuur)
- [Installatie](#-installatie)
- [Configuratie](#-configuratie)
- [Deployment](#-deployment)
- [Documentatie](#-documentatie)
- [Licentie](#-licentie)

---

## 🎯 Overzicht

Het DKL25 Admin Panel biedt een centrale plek voor het monitoren en beheren van alle aspecten van het hardloopevenement, inclusief aanmeldingen, communicatie, mediabestanden en partnerschappen.

### Kernfunctionaliteiten

#### 📊 Dashboard
- **Volledig Overzicht** - Real-time statistieken en metrics
- **Aanmeldingen** - Beheer van deelnemersregistraties
- **Contact** - Afhandeling van contactformulieren
- **Email Inbox** - Geïntegreerd emailbeheer

#### 🎨 Mediabeheer
- **Fotobeheer** - Upload, organiseer en beheer foto's
- **Albumbeheer** - Creëer en beheer fotoalbums
- **Videobeheer** - Beheer video content

#### 🤝 Relatiebeheer
- **Partnerbeheer** - Beheer van evenementpartners
- **Sponsorbeheer** - Beheer van sponsors en sponsorships

#### 👥 Gebruikersbeheer
- **RBAC Systeem** - Role-Based Access Control
- **Permissies** - Granulaire toegangscontrole
- **Gebruikers** - Volledige gebruikersadministratie

---

## 💻 Technische Stack

### Frontend
- **Framework:** React 18 met TypeScript
- **Routing:** React Router v6 (nested routes)
- **Styling:** Tailwind CSS met custom design system
- **UI Components:** Headless UI, Heroicons, Material UI
- **Forms:** React Hook Form met Zod validatie

### State Management
- **Server State:** React Query (TanStack Query)
- **Client State:** React Context API
  - Authentication context
  - Sidebar state
  - Navigation history
  - Favorites management

### Backend Integration
- **Database:** Supabase (PostgreSQL)
- **Media Storage:** Cloudinary
- **Email:** Nodemailer + ImapFlow
- **Authentication:** JWT met refresh tokens

### Development Tools
- **Build Tool:** Vite
- **Testing:** Vitest + React Testing Library
- **Code Quality:** ESLint + TypeScript
- **Version Control:** Git

---

## 📁 Projectstructuur

```
src/
├── api/                    # API layer
│   ├── client/             # API clients (Supabase, Cloudinary, Auth)
│   └── types/              # API-specific types
│
├── assets/                 # Static assets
│   └── DKLLogo.png
│
├── components/             # Shared components
│   ├── auth/               # Authentication components
│   ├── common/             # Common reusable components
│   ├── layout/             # Layout components (Header, Sidebar)
│   ├── typography/         # Typography components
│   └── ui/                 # Base UI components (Modal, DataTable)
│
├── config/                 # Configuration
│   ├── index.ts
│   └── zIndex.ts
│
├── features/               # Feature modules (domain-driven)
│   ├── aanmeldingen/       # Registration management
│   ├── albums/             # Album management
│   ├── auth/               # Authentication
│   ├── chat/               # Chat system
│   ├── contact/            # Contact messages
│   ├── dashboard/          # Dashboard overview
│   ├── email/              # Email management
│   ├── navigation/         # Navigation history
│   ├── newsletter/         # Newsletter management
│   ├── partners/           # Partner management
│   ├── photos/             # Photo management
│   ├── sponsors/           # Sponsor management
│   ├── under-construction/ # Under construction pages
│   ├── users/              # User & permissions management
│   └── videos/             # Video management
│
├── hooks/                  # Global custom hooks
│   ├── useAPI.ts
│   ├── useDebounce.ts
│   ├── useFilters.ts
│   ├── useForm.ts
│   ├── useImageUpload.ts
│   ├── useLocalStorage.ts
│   ├── usePageTitle.ts
│   ├── usePagination.ts
│   ├── useSorting.ts
│   └── useTheme.ts
│
├── lib/                    # Third-party integrations
│   └── services/           # Service utilities
│
├── pages/                  # Page components (route handlers)
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── PhotoManagementPage.tsx
│   └── ...
│
├── providers/              # Global context providers
│   ├── AppProviders.tsx
│   ├── FavoritesProvider.tsx
│   └── SidebarProvider.tsx
│
├── styles/                 # Global styles
│   ├── scrollbars.css
│   ├── shared.ts           # Shared style presets
│   └── index.css
│
├── types/                  # Global TypeScript types
│   ├── base.ts
│   ├── dashboard.ts
│   └── ...
│
└── utils/                  # Utility functions
    ├── apiErrorHandler.ts
    ├── caseConverter.ts
    └── validation.ts
```

### Feature Structure Pattern

Elke feature volgt een consistente structuur:

```
features/[feature-name]/
├── components/             # Feature-specific components
├── hooks/                  # Feature-specific hooks
├── services/               # Feature-specific services
├── types/                  # Feature-specific types
├── contexts/               # Feature-specific contexts (optional)
└── index.ts                # Barrel export
```

---

## 🔧 Installatie

### Vereisten
- Node.js 18+ 
- npm 9+

### Stappen

1. **Clone de repository**
   ```bash
   git clone [repository-url]
   cd DKL25AdminPanel
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Configureer omgevingsvariabelen**
   ```bash
   cp .env.example .env
   ```
   
   Vul de volgende variabelen in:
   - `VITE_SUPABASE_URL` - Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## ⚙️ Configuratie

### Omgevingsvariabelen

| Variabele | Beschrijving | Vereist |
|-----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL van de Supabase instance | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Anonieme sleutel voor Supabase API | ✅ |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud naam | ✅ |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Preset voor Cloudinary uploads | ✅ |

### Authenticatie

Het systeem gebruikt JWT-based authenticatie met:
- **Access tokens:** 20 minuten expiry
- **Refresh tokens:** 7 dagen expiry
- **Automatische token refresh**
- **Role-Based Access Control (RBAC)**

Zie [Authentication & Authorization](docs/architecture/authentication-and-authorization.md) voor details.

---

## 🚀 Deployment

### Vercel Deployment

Het project is geconfigureerd voor deployment via Vercel:

1. **Build command:** `npm run build`
2. **Output directory:** `dist`
3. **Framework preset:** Vite

### Build Scripts

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

### Deployment Checklist

- [ ] Omgevingsvariabelen geconfigureerd
- [ ] Database migraties uitgevoerd
- [ ] Backend API endpoints getest
- [ ] CORS instellingen geverifieerd
- [ ] SSL certificaten actief
- [ ] Error monitoring geconfigureerd

---

## 📚 Documentatie

Alle documentatie is georganiseerd in de [`docs/`](docs/) folder.

### 📖 Start Hier
- **[Documentatie Index](docs/README.md)** - Complete overzicht van alle documentatie

### 🏗️ Architectuur
- **[Authentication & Authorization](docs/architecture/authentication-and-authorization.md)** - Complete auth systeem
  - JWT authenticatie met refresh tokens
  - RBAC (Role-Based Access Control)
  - Frontend & backend implementatie
  - API endpoints en troubleshooting

- **[Components Reference](docs/architecture/components.md)** - Inventaris van alle 96 componenten
  - UI components (ConfirmDialog, EmptyState, LoadingGrid)
  - Layout components (Header, Sidebar, Navigation)
  - Feature components per domain

### 📘 Development Guides
- **[Refactoring Guide](docs/guides/refactoring.md)** - Code refactoring patterns
  - Folder structure (feature-first organisatie)
  - Code utilities (CRUD service, hooks, base types)
  - Migration guides (39% code reductie)

- **[Styling Guide](docs/guides/styling.md)** - Design system & styling
  - 51 styling presets (grids, buttons, forms)
  - Responsive design (mobile-first)
  - Dark mode support (100%)
  - 95% compliance score

- **[Testing Guide](docs/guides/testing.md)** - Testing best practices
  - Vitest + React Testing Library
  - Writing tests (unit & integration)
  - Coverage goals (75%+ target)

### 📊 Status Reports
- **[Features Audit](docs/reports/features-audit.md)** - Compliance audit
  - 17 features geanalyseerd
  - 95% overall compliance
  - Action plan voor verbeteringen

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Coverage Goals:**
- UI Components: 80%+
- Services: 70%+
- Overall: 75%+

Zie [Testing Guide](docs/guides/testing.md) voor details.

---

## 🎨 Styling

Het project gebruikt een custom design system gebaseerd op Tailwind CSS:

- **51 styling presets** voor consistentie
- **100% dark mode support**
- **Responsive design** (mobile-first)
- **Accessibility compliant** (WCAG AA)

Zie [Styling Guide](docs/guides/styling.md) voor details.

---

## 🔒 Beveiliging

### Implementaties
- ✅ JWT authenticatie met refresh tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Protected routes met permission checks
- ✅ HTTPS only in productie
- ✅ CORS configuratie
- ✅ Input validatie en sanitization
- ✅ XSS protection
- ✅ CSRF protection

### Security Best Practices
- Gebruik altijd HTTPS
- Roteer secrets regelmatig
- Monitor voor security vulnerabilities
- Houd dependencies up-to-date
- Review code voor security issues

---

## 📊 Performance

### Optimalisaties
- ✅ Code splitting per route (81% lazy loaded)
- ✅ Image lazy loading (100%)
- ✅ Bundle size optimization
- ✅ React Query caching
- ✅ Memoization waar nodig

### Metrics
- **Initial Load:** < 2s
- **Time to Interactive:** < 3s
- **Bundle Size:** Optimized per route
- **Lighthouse Score:** 90+

---

## 🤝 Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow coding standards
   - Write tests
   - Update documentation

3. **Test changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit changes**
   ```bash
   git commit -m "feat: add your feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Standards
- TypeScript strict mode
- ESLint compliance
- Prettier formatting
- Meaningful commit messages
- Test coverage > 75%

---

## 📝 Licentie

Copyright © 2025 De Keukenhof Loop. Alle rechten voorbehouden.

---

## 📞 Contact

Voor vragen of support:
- **Email:** info@dekoninklijkeloop.nl
- **Website:** https://dekoninklijkeloop.nl

---

**Laatst bijgewerkt:** 2025-01-08  
**Versie:** 2.0.0  
**Status:** Production Ready
