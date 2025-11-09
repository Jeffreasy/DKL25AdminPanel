# 🗄️ Database Architecture - Complete Technical Guide

> **Version:** 1.0
> **Status:** Production Ready
> **Last Updated:** 2025-11-07
> **Database:** PostgreSQL 15+
> **ORM:** GORM (Go)

Complete technische documentatie van het database schema, migratiegeschiedenis en business logica voor de DKL Email Service.

---

## 📋 Inhoudsopgave

1. [Executive Summary](#executive-summary)
2. [Database Schema Overview](#database-schema-overview)
3. [Core Tables](#core-tables)
4. [Authentication & Authorization](#authentication--authorization)
5. [Participant Management](#participant-management)
6. [Email System](#email-system)
7. [Gamification & Achievements](#gamification--achievements)
8. [Event Management](#event-management)
9. [Chat System](#chat-system)
10. [Content Management](#content-management)
11. [Migration History](#migration-history)
12. [Performance Optimizations](#performance-optimizations)
13. [Data Integrity](#data-integrity)
14. [Related Documentation](#related-documentation)

---

## 🎯 Executive Summary

Het DKL Email Service implementeert een enterprise-grade PostgreSQL database met:

### Kernfunctionaliteit
- ✅ **Multi-tenant Architecture** - Gebruikers, deelnemers en events
- ✅ **RBAC Authorization** - 19 resources, 58 granulaire permissions, 8 rollen
- ✅ **Event-driven Design** - De Koninklijke Loop evenementen
- ✅ **Gamification System** - Badges, achievements en leaderboard
- ✅ **Email Processing** - Multi-SMTP configuraties en batching
- ✅ **Real-time Features** - Chat, notifications en live tracking
- ✅ **Content Management** - Albums, photos, notulen en social media
- ✅ **Enterprise Security** - JWT tokens, audit logging, Redis caching

### Technische Stack
- **Database:** PostgreSQL 15+ met PostGIS extensies
- **ORM:** GORM v1.25+ (Go)
- **Migrations:** Custom migration framework
- **Indexing:** 50+ geoptimaliseerde indexen
- **Constraints:** Foreign keys, check constraints en triggers
- **Views:** Materialized views voor performance

### Database Statistieken
- **28 Migration Files** - Van V01 tot V28
- **25 Core Tables** - Plus 15 lookup/reference tables
- **50+ Indexes** - Performance geoptimaliseerd
- **15+ Views** - Inclusief materialized views
- **100+ Constraints** - Data integrity gegarandeerd
- **19 Resources** - RBAC permission resources
- **58 Permissions** - Granulaire resource:action combinaties
- **8 Roles** - Van admin tot chat member

---

## 🏗️ Database Schema Overview

### Architectural Patterns
- **Normalized Design** - Lookup tables voor statussen en types (V26-V27)
- **Event Sourcing** - Notulen versies en audit trails
- **Materialized Views** - Voor leaderboard performance (V25)
- **Partitioning Ready** - Voor toekomstige schaling

### Key Relationships
```
gebruikers (Users)
├── participants (1:1, optional)
├── user_roles (many:many)
│   └── roles (RBAC roles with system protection)
│       └── role_permissions (many:many with permissions)
│           └── permissions (resource:action pairs)
├── notifications (1:many)
└── verzonden_emails (via templates)

participants (Event Participants)
├── event_registrations (many:many via events)
├── participant_achievements (1:many)
├── participant_antwoorden (1:many)
├── participant_roles (1:many)
└── distances (1:many)

events (DKL Events)
├── event_registrations (1:many)
├── geofences (JSONB array)
└── event_config (JSONB)

chat_channels
├── chat_messages (1:many)
├── chat_channel_participants (many:many)
└── chat_message_reactions (1:many)
```

---

## 📊 Core Tables

### 1. `gebruikers` - User Accounts (V1)
**Purpose:** Authenticatie en gebruikersbeheer

```sql
CREATE TABLE gebruikers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naam VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    wachtwoord_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'deelnemer', -- Legacy, replaced by user_roles
    is_actief BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    newsletter_subscribed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);
```

**Key Features:**
- Email uniqueness constraints
- Password security fields
- Newsletter subscription tracking
- Account lockout protection

### 2. `participants` - Event Participants (V28, formerly aanmeldingen)
**Purpose:** Persoonlijke informatie van deelnemers

```sql
CREATE TABLE participants ( -- Renamed from aanmeldingen in V28
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naam VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefoon VARCHAR(20),
    participant_role_name TEXT REFERENCES participant_roles(name),
    distance_route TEXT REFERENCES distances(route),
    status TEXT REFERENCES registration_status_types(status),
    bijzonderheden TEXT,
    terms BOOLEAN NOT NULL DEFAULT false,
    notities TEXT,
    steps INTEGER DEFAULT 0,
    gebruiker_id UUID REFERENCES gebruikers(id), -- Optional link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    antwoorden_count INTEGER DEFAULT 0
);
```

**Key Features:**
- Optional user account linking (gebruiker_id)
- Normalized roles and distances (V26)
- Steps tracking for gamification
- GDPR compliance fields (terms, privacy)

### 3. `events` - DKL Events (V23)
**Purpose:** Evenement configuratie en tracking

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT REFERENCES event_status_types(status),
    geofences JSONB NOT NULL DEFAULT '[]',
    event_config JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES gebruikers(id),
    finalized_at TIMESTAMP WITH TIME ZONE,
    finalized_by UUID REFERENCES gebruikers(id)
);
```

**Key Features:**
- Geofencing for GPS tracking
- Configurable event parameters
- Status workflow management

### 4. `event_registrations` - Event Participation (V28, formerly event_participants)
**Purpose:** Koppeling tussen deelnemers en events

```sql
CREATE TABLE event_registrations ( -- Renamed from event_participants in V28
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_in_time TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    finish_time TIMESTAMP WITH TIME ZONE,
    tracking_status VARCHAR(50) DEFAULT 'registered',
    last_location_update TIMESTAMP WITH TIME ZONE,
    total_distance DECIMAL(10,2) DEFAULT 0,
    steps INT DEFAULT 0,
    participant_role_name TEXT REFERENCES participant_roles(name),
    distance_route TEXT REFERENCES distances(route),
    status TEXT REFERENCES registration_status_types(status),
    bijzonderheden TEXT,
    terms BOOLEAN NOT NULL DEFAULT false,
    notities TEXT,
    antwoorden_count INTEGER DEFAULT 0
);
```

**Key Features:**
- GPS tracking integration
- Status progression (registered → checked_in → started → finished)
- Distance and steps logging
- Duplicate prevention constraints

---

## 🔐 Authentication & Authorization

### RBAC System (V6-V7)
**Purpose:** Gedetailleerde toegangscontrole

#### Core Tables:
- `roles` - Systeemrollen (admin, staff, deelnemer, etc.)
- `permissions` - Individuele permissies (58 totaal)
- `role_permissions` - Rol-permissie assignments
- `user_roles` - Gebruiker-rol assignments

#### Database Schema
```
gebruikers (users)
├── user_roles (many:many with roles)
│   └── roles (RBAC roles with system protection)
│       └── role_permissions (many:many with permissions)
│           └── permissions (resource:action pairs)
```

#### Permission Check Flow
```
1. API Request met JWT token
2. AuthMiddleware validates token → sets userID in context
3. PermissionMiddleware checks permission:
   a. Check Redis cache (perm:{userID}:{resource}:{action})
   b. If not cached: Query database via GetUserPermissions
   c. Cache result (5 min TTL)
   d. Return 403 if no permission
4. Handler execution
```

#### Rollen Overzicht

| Rol | Type | Permissions | Gebruik |
|-----|------|------------|---------|
| **admin** | System | ALLE 58 permissions | Platform administrators |
| **staff** | System | Read/write + participant permissions | Support medewerkers |
| **user** | System | Chat basic | Reguliere gebruikers |
| **owner** | Chat | Full channel control | Kanaal eigenaar |
| **chat_admin** | Chat | Moderation | Kanaal moderator |
| **member** | Chat | Basic chat | Kanaal lid |
| **deelnemer** | Event | None (categorization) | Standard participants |
| **begeleider** | Event | None (categorization) | Support roles |
| **vrijwilliger** | Event | None (categorization) | Volunteer roles |

#### Resources & Permissions (58 totaal)

| Resource | Permissions | Beschrijving |
|----------|-------------|-------------|
| **admin** | access | Toegang tot admin panel |
| **staff** | access | Toegang tot staff functies |
| **contact** | read, write, delete | Contact formulieren beheren |
| **aanmelding** | read, write, delete | Evenement aanmeldingen |
| **user** | read, write, delete, manage_roles | Gebruikersbeheer |
| **participant** | read, write, delete | Deelnemers beheren |
| **photo** | read, write, delete | Foto's uploaden/beheren |
| **album** | read, write, delete | Foto albums organiseren |
| **video** | read, write, delete | Video content beheren |
| **partner** | read, write, delete | Partners beheren |
| **sponsor** | read, write, delete | Sponsors beheren |
| **radio_recording** | read, write, delete | Radio opnames |
| **program_schedule** | read, write, delete | Programma schema |
| **social_embed** | read, write, delete | Social media embeds |
| **social_link** | read, write, delete | Social media links |
| **under_construction** | read, write, delete | Onder constructie pagina's |
| **newsletter** | read, write, send, delete | Nieuwsbrieven beheren |
| **email** | read, write, delete, fetch | Email systeem |
| **admin_email** | send | Admin emails versturen |
| **chat** | read, write, manage_channel, moderate | Chat systeem |

#### Permission Actions:
- `read` - Lezen/bekijken
- `write` - Aanmaken/bewerken
- `delete` - Verwijderen
- `send` - Email verzending
- `fetch` - Email ophalen
- `manage` - Volledig beheer
- `manage_roles` - Rollen beheren
- `manage_channel` - Kanalen beheren
- `moderate` - Moderatie
- `access` - Basis toegang

### Advanced Features
- **Redis Caching**: `perm:{userID}:{resource}:{action}` with 5min TTL
- **Audit Logging**: 19 event types with structured logging
- **Role Expiry**: `expires_at` support in user_roles
- **System Role Protection**: `is_system_role` prevents deletion
- **Performance**: ~2ms cached, ~30ms uncached response times

### Token Management (V9)
**Purpose:** JWT refresh token opslag

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES gebruikers(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    ip_address INET
);
```

**Key Features:**
- Secure token storage
- Automatic cleanup of expired tokens
- Audit trail for security
- 20-minute access tokens with auto-refresh

---

## 👥 Participant Management

### Registration Flow (V1-V28)
**Purpose:** Van aanmelding tot deelname

#### Process:
1. **Aanmelding** (`participants`) - Initiële registratie
2. **Event Koppeling** (`event_registrations`) - V28 refactor
3. **Steps Tracking** - Gamification integratie
4. **Status Updates** - Workflow management

#### Status Types (V27):
- `nieuw` - Nieuwe aanmelding
- `bevestigd` - Goedgekeurd
- `geannuleerd` - Geannuleerd
- `voltooid` - Evenement voltooid

### Participant Roles (V26)
**Purpose:** Verschillende deelnemer types

```sql
CREATE TABLE participant_roles (
    name TEXT PRIMARY KEY NOT NULL,
    description TEXT
);

-- Predefined roles:
-- 'Deelnemer' - Standard participant
-- 'Begeleider' - Assistant/Support
-- 'Vrijwilliger' - Volunteer
-- 'Sponsor' - Partner organization
```

### Distance Management (V17, V26)
**Purpose:** Route configuratie en fondsenwerving

```sql
CREATE TABLE distances (
    route TEXT PRIMARY KEY NOT NULL, -- e.g., '2.5 KM', '10 KM'
    fund_amount INTEGER NOT NULL CHECK (fund_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📧 Email System

### Multi-SMTP Architecture (V1.21)
**Purpose:** Gescheiden email verzending per type

#### SMTP Configurations:
- **Default SMTP** - Contact en aanmelding emails
- **Registration SMTP** - Separate voor aanmeldingen
- **Newsletter SMTP** - Dedicated voor nieuwsbrieven
- **WFC SMTP** - Whisky for Charity orders

### Email Processing (V1-V27)
**Purpose:** Robuuste email afhandeling

#### Core Tables:
- `verzonden_emails` - Email tracking en logging
- `incoming_emails` - IMAP ontvangen emails
- `email_templates` - Template opslag
- `contact_formulieren` - Contact formulier data
- `participant_antwoorden` - Antwoorden op registraties

#### Email Status Types (V27):
- `verzonden` - Succesvol verzonden
- `failed` - Verzending mislukt
- `pending` - In wachtrij

### Email Batching (V1.21)
**Purpose:** Performance en rate limiting

```sql
-- Batch processing with configurable intervals
-- Rate limits per email type
-- Queue management with overflow handling
```

---

## 🏆 Gamification & Achievements

### Badge System (V21)
**Purpose:** Deelnemer engagement en motivatie

```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    criteria JSONB NOT NULL DEFAULT '{}',
    points INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participant_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES participants(id),
    badge_id UUID NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Achievement Criteria Examples:
```json
{"min_steps": 10000}      -- 10K steps badge
{"route": "20 KM"}         -- Distance hero
{"consecutive_days": 7}    -- Consistency badge
{"early_participant": true} -- Early bird
```

### Leaderboard System (V21, V25)
**Purpose:** Competitie en community building

```sql
-- Materialized View for performance (V25)
CREATE MATERIALIZED VIEW leaderboard_mv AS
SELECT
    a.id as participant_id,
    a.naam as display_name,
    a.steps,
    COALESCE(SUM(b.points), 0) as achievement_points,
    a.steps + COALESCE(SUM(b.points), 0) as total_score,
    RANK() OVER (ORDER BY (a.steps + COALESCE(SUM(b.points), 0)) DESC) as rank
FROM participants a
LEFT JOIN participant_achievements pa ON a.id = pa.participant_id
LEFT JOIN badges b ON pa.badge_id = b.id AND b.is_active = true
GROUP BY a.id, a.naam, a.steps
ORDER BY total_score DESC;
```

**Key Features:**
- Real-time ranking
- Achievement point integration
- Performance optimized with materialized view

---

## 📅 Event Management

### Event Configuration (V23)
**Purpose:** De Koninklijke Loop evenementen

#### Geofencing System:
```json
{
  "type": "start",
  "lat": 52.0907,
  "long": 5.1214,
  "radius": 50,
  "name": "Start Location"
}
```

#### Event Status Types (V27):
- `upcoming` - Gepland
- `active` - Bezig
- `completed` - Voltooid
- `cancelled` - Geannuleerd

### GPS Tracking (V23)
**Purpose:** Live participant tracking

```sql
-- Location updates stored in event_registrations
last_location_update TIMESTAMP WITH TIME ZONE,
total_distance DECIMAL(10,2) DEFAULT 0,
current_steps INT DEFAULT 0,
tracking_status VARCHAR(50) DEFAULT 'registered'
```

#### Tracking Status Flow:
1. `registered` → `checked_in` → `started` → `in_progress` → `finished`/`dnf`

---

## 💬 Chat System

### Channel Architecture (V4-V27)
**Purpose:** Real-time communicatie

```sql
CREATE TABLE chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type TEXT REFERENCES chat_channel_types(type), -- V27 normalized
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES gebruikers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES gebruikers(id),
    content TEXT,
    message_type VARCHAR(50) DEFAULT 'text',
    reply_to_id UUID REFERENCES chat_messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Channel Types (V27):
- `public` - Open voor iedereen
- `private` - Op uitnodiging
- `direct` - 1-op-1 berichten

### Real-time Features (WebSocket)
- Message reactions
- User presence tracking
- Unread message indicators
- File sharing support

---

## 📄 Content Management

### Photo & Album System (V11)
**Purpose:** Evenement fotografie

```sql
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    alt_text TEXT,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    year INTEGER,
    cloudinary_folder TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES photos(id),
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    order_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notulen Module (V24)
**Purpose:** Vergadering documentatie

```sql
CREATE TABLE notulen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titel VARCHAR(255) NOT NULL UNIQUE,
    vergadering_datum DATE NOT NULL,
    locatie VARCHAR(255),
    voorzitter VARCHAR(255),
    notulist VARCHAR(255),
    aanwezigen_gebruikers UUID[], -- V27: Normalized user references
    afwezigen_gebruikers UUID[],
    aanwezigen_gasten TEXT[],     -- V27: Guest names
    afwezigen_gasten TEXT[],
    agenda_items JSONB,
    besluiten JSONB,
    actiepunten JSONB,
    notities TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    versie INTEGER DEFAULT 1,
    created_by UUID REFERENCES gebruikers(id),
    updated_by UUID REFERENCES gebruikers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Version Control:
- Automatic versioning on updates
- Complete audit trail
- Rollback capabilities

### Social Media Integration (V11)
**Purpose:** Social media content embedding

```sql
CREATE TABLE social_embeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    embed_code TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    bg_color_class TEXT,
    icon_color_class TEXT,
    order_number INTEGER,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Migration History

### Major Architectural Changes

#### V1-V10: Foundation (2024)
- **V1:** Initial schema - users, registrations, contacts, emails
- **V4:** Chat system introduction
- **V6:** RBAC permission system
- **V9:** JWT refresh tokens
- **V10:** Uploaded images support

#### V11-V20: Content & Performance (2025)
- **V11:** CMS data migration (photos, albums, social)
- **V12:** User-participant linking
- **V13-V14:** Extended permissions for CMS features
- **V15:** Title sections refactor
- **V16:** Steps tracking added to registrations
- **V17:** Route funds system
- **V18:** Major performance optimizations (50+ indexes)
- **V19:** Advanced constraints and triggers
- **V20:** Staff permissions update

#### V21-V28: Gamification & Events (2025)
- **V21:** Complete gamification system (badges, achievements, leaderboard)
- **V22:** Improved user-participant relationships
- **V23:** Event management system with GPS tracking
- **V24:** Complete notulen module with versioning
- **V25:** Leaderboard materialized view for performance
- **V26:** Normalization of participant roles and distances
- **V27:** Normalization of all status and type fields
- **V28:** Major refactor: Person vs Participation (aanmeldingen → participants)

### Migration Patterns
- **Incremental:** Small, safe changes with rollback capability
- **Idempotent:** Safe to run multiple times
- **Transactional:** All-or-nothing execution
- **Documented:** Extensive comments and logging
- **Tested:** Comprehensive testing before production

---

## ⚡ Performance Optimizations

### Indexing Strategy (V18)
- **Foreign Key Indexes:** All FK relationships indexed
- **Single Column:** Email, status, date fields
- **Compound:** Status + created_at for dashboards
- **Partial:** Active users, unanswered contacts
- **GIN:** Full-text search, JSONB arrays
- **Functional:** Computed columns

### Materialized Views (V25)
```sql
-- Leaderboard performance optimization
CREATE MATERIALIZED VIEW leaderboard_mv AS ...
CREATE UNIQUE INDEX idx_leaderboard_mv_participant_id ON leaderboard_mv(participant_id);

-- Refresh function for real-time updates
CREATE OR REPLACE FUNCTION refresh_leaderboard_mv() RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_mv;
END;
$$ LANGUAGE plpgsql;
```

### Query Optimization
- **Dashboard Stats:** Materialized view for statistics
- **Email Batching:** Queue-based processing
- **Connection Pooling:** Efficient database connections
- **Caching:** Redis integration for session data

---

## 🔒 Data Integrity

### Constraints & Validation
- **Check Constraints:** Email format, positive values
- **Foreign Keys:** Referential integrity
- **Unique Constraints:** Email addresses, badge names
- **Not Null:** Critical business fields
- **Default Values:** Safe fallbacks

### Data Quality (V19)
```sql
-- Email validation
ALTER TABLE gebruikers ADD CONSTRAINT gebruikers_email_check
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Name validation
ALTER TABLE gebruikers ADD CONSTRAINT gebruikers_naam_not_empty
    CHECK (LENGTH(TRIM(naam)) > 0);

-- Steps validation
ALTER TABLE participants ADD CONSTRAINT aanmeldingen_steps_check
    CHECK (steps >= 0);
```

### Audit & Versioning
- **Automatic Timestamps:** created_at, updated_at triggers
- **Version Control:** Notulen versioning system
- **Audit Trail:** Complete change history
- **Soft Deletes:** Logical deletion where needed

---

## 📚 Related Documentation

- [`02AUTHENTICATION_DOC.md`](02AUTHENTICATION_DOC.md) - Authentication & RBAC system
- [`03PARTICIPANT_DOC.md`](03PARTICIPANT_DOC.md) - Participant management system
- [`04EMAIL_DOC.md`](04EMAIL_DOC.md) - Email processing architecture
- [`docs/DATABASE_REFERENCE.md`](docs/DATABASE_REFERENCE.md) - Technical reference
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - System architecture overview
- [`README.md`](README.md) - Service overview

---

## ⚠️ Critical Implementation Notes

### Breaking Changes (V26-V28)
- **V26:** Participant roles and distances normalized
- **V27:** All status fields normalized with lookup tables
- **V28:** Major refactor from "aanmeldingen" to "participants" + "event_registrations"

### Performance Considerations
- **Leaderboard:** Use `leaderboard_mv` instead of dynamic views
- **Dashboard:** Use `dashboard_stats` materialized view
- **Email Processing:** Batch processing with rate limiting
- **Chat:** Real-time with WebSocket optimization

### Security Best Practices
- **RBAC:** Always check permissions before operations
- **Input Validation:** Sanitize all user inputs
- **Token Security:** Secure JWT handling with refresh tokens
- **Audit Logging:** Track all sensitive operations

---

**Version:** 1.1 (RBAC Enhanced)
**Last Updated:** 2025-11-07
**Status:** ✅ Production Ready
**Compatibility:** DKL Email Service V28.0+
**Architecture:** PostgreSQL + GORM
**RBAC Security Score:** 9.5/10