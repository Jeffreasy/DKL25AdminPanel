# 🏃‍♂️ DKL25 Admin Panel

> **Modern Admin Panel voor De Koninklijke Loop 25**  
> Built with React, TypeScript, Vite, and Tailwind CSS

[![Tests](https://img.shields.io/badge/tests-425%20passing-success)](docs/testing/README.md)
[![Coverage](https://img.shields.io/badge/coverage-80--85%25-success)](docs/testing/reports/coverage-report.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### Content Management
- 📸 **Photo Management** - Upload, organize, and manage photos
- 📁 **Album Management** - Create and manage photo albums
- 🎥 **Video Management** - Upload and organize videos
- 📰 **Newsletter Management** - Create and send newsletters

### User Management
- 👥 **User Administration** - Manage user accounts
- 🔐 **Role-Based Access Control (RBAC)** - Granular permissions
- 🛡️ **Authentication** - Secure JWT-based auth with Supabase

### Communication
- 💬 **Chat System** - Real-time messaging
- 📧 **Email Management** - Admin email interface
- 📝 **Contact Messages** - Handle contact form submissions
- 📋 **Registration Management** - Event registrations

### Business Features
- 🤝 **Partner Management** - Manage business partners
- 🏆 **Sponsor Management** - Track and display sponsors
- 📊 **Dashboard** - Overview and analytics
- 🔍 **Advanced Search** - Quick navigation and search

### UI/UX Features
- 🎨 **Modern Design** - Clean, responsive interface
- 📱 **Mobile Responsive** - Works on all devices
- 🌙 **Dark Mode** - Theme support
- ⚡ **Fast Performance** - Optimized with Vite
- ♿ **Accessible** - WCAG compliant

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Context API + React Query
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **UI Components:** Headless UI

### Backend Integration
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudinary
- **Authentication:** JWT + Supabase Auth
- **API:** RESTful with Supabase Client

### Testing
- **Unit/Integration:** Vitest + React Testing Library
- **E2E:** Playwright
- **API Mocking:** MSW (Mock Service Worker)
- **Coverage:** 80-85% (target: 75%+) ✅

### Development Tools
- **Build Tool:** Vite
- **Testing:** Vitest + React Testing Library
- **Code Quality:** ESLint + TypeScript
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/DKL25AdminPanel.git
cd DKL25AdminPanel

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# API Configuration
VITE_API_URL=https://api.dekoninklijkeloop.nl
```

### Quick Verification

```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Testing

### Complete Testing Documentation
**📁 [Testing Documentation Hub](docs/testing/README.md)** - Complete guide and resources

### Quick Start
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run E2E tests
npm run test:e2e
```

### Current Status
- ✅ **425 tests** passing (98.8% pass rate)
- ✅ **80-85% coverage** (exceeded 75% target)
- ✅ **Production ready** test suite
- ✅ **CI/CD integrated** with GitHub Actions

### Testing Resources
- [Quick Start Guide](docs/testing/guides/quick-start.md) - 5-minute setup
- [Setup Guide](docs/testing/guides/setup-guide.md) - Detailed installation
- [Comprehensive Plan](docs/testing/guides/comprehensive-plan.md) - Full strategy
- [Troubleshooting](docs/testing/guides/troubleshooting.md) - Common issues

---

## 📚 Documentation

### Main Documentation
- **[Documentation Hub](docs/README.md)** - Complete documentation index

### Architecture
- [Components Architecture](docs/architecture/components.md) - Component structure
- [Authentication & Authorization](docs/architecture/authentication-and-authorization.md) - RBAC system

### Guides
- [API Integration](docs/guides/api-integration.md) - Working with APIs
- [State Management](docs/guides/state-management.md) - Managing state
- [Styling Guide](docs/guides/styling.md) - CSS conventions
- [Contributing](docs/guides/contributing.md) - How to contribute
- [Deployment](docs/guides/deployment.md) - Production deployment

### Testing
- [Testing Hub](docs/testing/README.md) - Complete testing documentation
- [Quick Start](docs/testing/guides/quick-start.md) - Get started quickly
- [Coverage Report](docs/testing/reports/coverage-report.md) - Current coverage

---

## 📁 Project Structure

```
DKL25AdminPanel/
├── docs/                              # Documentation
│   ├── README.md                     # Documentation hub
│   ├── architecture/                 # Architecture docs
│   ├── guides/                       # Development guides
│   ├── testing/                      # Testing documentation
│   │   ├── README.md                # Testing hub
│   │   ├── guides/                  # Testing guides
│   │   └── reports/                 # Testing reports
│   └── reports/                      # Project reports
├── e2e/                              # E2E tests
├── public/                           # Static assets
├── src/                              # Source code
│   ├── api/                          # API clients
│   ├── components/                   # React components
│   │   ├── auth/                    # Auth components
│   │   ├── common/                  # Common components
│   │   ├── layout/                  # Layout components
│   │   ├── typography/              # Typography components
│   │   └── ui/                      # UI components
│   ├── features/                     # Feature modules
│   │   ├── aanmeldingen/           # Registrations
│   │   ├── albums/                 # Albums
│   │   ├── auth/                   # Authentication
│   │   ├── chat/                   # Chat system
│   │   ├── contact/                # Contact messages
│   │   ├── dashboard/              # Dashboard
│   │   ├── email/                  # Email management
│   │   ├── newsletter/             # Newsletter
│   │   ├── partners/               # Partners
│   │   ├── photos/                 # Photos
│   │   ├── sponsors/               # Sponsors
│   │   ├── users/                  # User management
│   │   └── videos/                 # Videos
│   ├── hooks/                        # Custom hooks
│   ├── lib/                          # Utilities & services
│   ├── pages/                        # Page components
│   ├── providers/                    # Context providers
│   ├── styles/                       # Global styles
│   ├── test/                         # Test utilities
│   ├── types/                        # TypeScript types
│   ├── utils/                        # Utility functions
│   ├── App.tsx                       # Main app component
│   └── main.tsx                      # Entry point
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── eslint.config.js                  # ESLint config
├── index.html                        # HTML template
├── package.json                      # Dependencies
├── playwright.config.ts              # Playwright config
├── postcss.config.js                 # PostCSS config
├── README.md                         # This file
├── tailwind.config.cjs               # Tailwind config
├── tsconfig.json                     # TypeScript config
└── vite.config.ts                    # Vite config
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Testing
npm test                 # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:all         # Run all tests

# Type Checking
npm run type-check       # Check TypeScript types
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following project conventions
   - Add tests for new features
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations executed
- [ ] Backend API endpoints tested
- [ ] CORS settings verified
- [ ] SSL certificates configured
- [ ] CDN configured (if applicable)
- [ ] Monitoring set up
- [ ] Backup strategy in place

### Deployment Guide

See [Deployment Guide](docs/guides/deployment.md) for detailed instructions.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/guides/contributing.md) for details.

### Quick Contribution Guide

1. **Fork the Repository**
2. **Create Feature Branch**
3. **Make Your Changes**
   - Follow coding standards
   - Write tests
   - Update documentation
4. **Test Your Changes**
   ```bash
   npm test
   npm run build
   ```
5. **Submit Pull Request**

### Code Standards

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow existing code style

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Development Team**
- Project Lead: [Name]
- Frontend Developers: [Names]
- Backend Developers: [Names]
- QA Engineers: [Names]

---

## 📞 Support

For questions or issues:
- 📧 Email: support@dekoninklijkeloop.nl
- 📚 Documentation: [docs/README.md](docs/README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/DKL25AdminPanel/issues)

---

## 🎯 Project Status

### Current Version: 2.0

### Recent Updates
- ✅ Testing infrastructure complete (80-85% coverage)
- ✅ RBAC system implemented
- ✅ All core features functional
- ✅ Production-ready deployment
- ✅ Comprehensive documentation

### Roadmap
- [ ] Reach 90% test coverage
- [ ] Performance optimization
- [ ] Enhanced analytics
- [ ] Mobile app integration

---

**Built with ❤️ by the DKL25 Development Team**

For more information, visit [dekoninklijkeloop.nl](https://dekoninklijkeloop.nl)
