# DKL25 Admin Panel

Een administratief dashboard voor het beheer van De Keukenhof Loop 25 (DKL25) evenement.

## 📋 Projectbeschrijving

Dit admin panel is ontwikkeld voor het beheer van De Keukenhof Loop, een hardloopevenement. Het paneel biedt de organisatie een centrale plek voor het monitoren en beheren van aanmeldingen, communicatie, mediabestanden en partnerschappen.

## 🚀 Kernapplicaties

De applicatie bestaat uit verschillende hoofdmodules:

- **Dashboard**: Statistieken over aanmeldingen, berichten en reactietijden met verschillende tabs:
  - Volledig Overzicht
  - Aanmeldingen
  - Contact
  - Email Inbox

- **Mediabeheer**:
  - Fotobeheer
  - Albumbeheer
  - Videobeheer

- **Relatiebeheer**:
  - Partnerbeheer
  - Sponsorbeheer

## 💻 Gebruikersinterface

- **Responsive Design**: Aparte layouts voor desktop en mobiele gebruikers
- **Navigatie**:
  - Zijbalk met menu (inklapbaar op desktop)
  - Mobiele navigatie met slide-in menu
  - Favorieten en recente pagina's
- **Thema**: Ondersteunt zowel lichte als donkere modus

## 🛠️ Technische Stack

- **Frontend Framework**: React 18 met TypeScript
- **Routing**: React Router v6 (met nested routes)
- **State Management**: 
  - React Query voor server state
  - React Context voor applicatie state (auth, sidebar, navigatie-geschiedenis, favorieten)
- **Styling**: Tailwind CSS
- **UI-componenten**: 
  - Headless UI voor toegankelijke componenten
  - Heroicons voor iconen
  - Material UI componenten
- **Formulieren**: React Hook Form met Zod validatie
- **Backend Integratie**: Supabase
- **Media Handling**: Cloudinary voor uploads, React Dropzone
- **Email Integratie**: Nodemailer en ImapFlow

## 📁 Projectstructuur

```
src/
├── components/         # UI-componenten
│   ├── auth/           # Authenticatie componenten
│   ├── layout/         # Layout componenten (navigatie, header, etc.)
├── contexts/           # React Context providers
│   ├── auth/           # Authenticatie context
│   ├── favorites/      # Favorieten pagina's context
│   ├── navigation/     # Navigatiegeschiedenis context
│   ├── sidebar/        # Sidebar context
├── features/           # Feature modules
│   ├── aanmeldingen/   # Deelnemersregistratie feature
│   ├── contact/        # Contact/berichten feature
├── hooks/              # Custom React hooks
├── pages/              # Pagina componenten
│   ├── DashboardPage   # Dashboard met tabs
│   ├── Media pagina's  # Foto's, albums, video's
│   ├── Relatie pagina's # Partners, sponsors
├── styles/             # CSS en styling
├── types/              # TypeScript typedefinities
└── services/           # API services
```

## 🔧 Installatie & Ontwikkeling

1. Clone de repository
   ```bash
   git clone [repository-url]
   cd DKL25AdminPanel
   ```

2. Installeer dependencies
   ```bash
   npm install
   ```

3. Configureer omgevingsvariabelen
   ```bash
   cp .env.example .env
   # Vul de benodigde variabelen in
   ```

4. Start de development server
   ```bash
   npm run dev
   ```

## 🔐 Beveiliging

- Protected routes met AuthGuard component
- Supabase authenticatie integratie

## 🚀 Deployment

De applicatie is geconfigureerd voor deployment via Vercel:
- Vercel configuratie aanwezig in vercel.json
- Build-stap: `npm run build`

## 📋 Omgevingsvariabelen

| Variabele | Beschrijving |
|-----------|-------------|
| VITE_SUPABASE_URL | URL van de Supabase instance |
| VITE_SUPABASE_ANON_KEY | Anonieme sleutel voor Supabase API |
| VITE_CLOUDINARY_CLOUD_NAME | Cloudinary cloud naam voor media uploads |
| VITE_CLOUDINARY_UPLOAD_PRESET | Preset voor Cloudinary uploads |
