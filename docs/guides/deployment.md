# 🚀 Deployment Guide

> **Versie:** 1.0 | **Status:** Complete | **Laatste Update:** 2025-01-08

Complete deployment guide voor het DKL25 Admin Panel.

---

## 📋 Inhoudsopgave

- [Overzicht](#-overzicht)
- [Vercel Deployment](#-vercel-deployment)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Pre-Deployment](#-pre-deployment)
- [Post-Deployment](#-post-deployment)
- [Monitoring](#-monitoring)

---

## 🎯 Overzicht

Het DKL25 Admin Panel is geconfigureerd voor deployment op Vercel met Supabase als backend.

### Tech Stack

- **Frontend Hosting:** Vercel
- **Backend API:** Custom Go/Fiber server (Render)
- **Database:** Supabase (PostgreSQL)
- **Media Storage:** Cloudinary
- **Caching:** Redis

---

## 🌐 Vercel Deployment

### Configuratie

**Locatie:** [`vercel.json`](../../vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Build Scripts

```bash
# Production build
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run build:analyze
```

### Deployment Steps

1. **Connect Repository**
   - Link GitHub repository to Vercel
   - Select main branch for production

2. **Configure Build**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Add all required VITE_* variables
   - See [Environment Setup](#environment-setup)

4. **Deploy**
   - Automatic deployment on push to main
   - Preview deployments for PRs

---

## ⚙️ Environment Setup

### Frontend Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# API
VITE_API_BASE_URL=https://api.dekoninklijkeloop.nl
```

### Backend Environment Variables

```bash
# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_TOKEN_EXPIRY=20m

# Database
DB_HOST=db.your-project.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
DB_SSL_MODE=require

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
```

---

## 🗄️ Database Setup

### Supabase Configuration

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note URL and anon key

2. **Run Migrations**
   ```bash
   # If using Supabase CLI
   supabase migration up
   
   # Or run SQL directly in Supabase dashboard
   ```

3. **Seed Data**
   ```sql
   -- Insert basis rollen
   INSERT INTO roles (name, description) VALUES
     ('admin', 'Volledige toegang'),
     ('staff', 'Staff toegang'),
     ('user', 'Basis toegang');
   
   -- Insert basis permissies
   INSERT INTO permissions (resource, action, description) VALUES
     ('contact', 'read', 'Contactformulieren bekijken'),
     ('contact', 'write', 'Contactformulieren bewerken');
   ```

4. **Configure RLS (Row Level Security)**
   - Enable RLS on sensitive tables
   - Create policies for authenticated users

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors
- [ ] Code reviewed

### Configuration
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Database migrations ready
- [ ] CORS settings verified

### Security
- [ ] JWT_SECRET set (production value)
- [ ] HTTPS enforced
- [ ] Secrets not in code
- [ ] Rate limiting configured

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Caching configured

---

## 🔍 Post-Deployment Checklist

### Functionality
- [ ] Login works
- [ ] Permissions load correctly
- [ ] All features accessible
- [ ] Forms submit successfully
- [ ] File uploads work

### Performance
- [ ] Initial load < 2s
- [ ] Time to interactive < 3s
- [ ] Lighthouse score > 90
- [ ] No console errors

### Security
- [ ] HTTPS active
- [ ] Auth tokens secure
- [ ] API endpoints protected
- [ ] CORS configured correctly

### Monitoring
- [ ] Error tracking active
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Uptime monitoring

---

## 📊 Monitoring

### Error Tracking

**Recommended:** Sentry, LogRocket, or similar

```typescript
// Example Sentry setup
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0
})
```

### Performance Monitoring

```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### Health Checks

```bash
# Frontend health
curl https://admin.dekoninklijkeloop.nl

# Backend health
curl https://api.dekoninklijkeloop.nl/health

# Database health
curl https://api.dekoninklijkeloop.nl/api/health/db
```

---

## 🔄 Rollback Procedure

### Vercel Rollback

1. Go to Vercel dashboard
2. Select deployment
3. Click "Promote to Production" on previous deployment

### Database Rollback

```bash
# Rollback last migration
supabase migration down

# Or restore from backup
supabase db restore backup-name
```

---

## 📚 Referenties

### Configuration Files
- [`vercel.json`](../../vercel.json)
- [`package.json`](../../package.json)
- [`.env.example`](../../.env.example)

### Related Guides
- [API Integration](api-integration.md)
- [Authentication](../architecture/authentication-and-authorization.md)

---

**Versie:** 1.0  
**Laatste Update:** 2025-01-08  
**Status:** Complete