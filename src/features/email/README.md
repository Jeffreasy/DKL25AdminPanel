# Email Module

Deze module bevat de functies en componenten voor het werken met emails in de DKL Admin Panel applicatie.

## Overzicht

De email-module bestaat uit:

1. **API Services**:
   - `emailService.ts`: Core service voor het ophalen en manipuleren van emails via de Go API
   - `adminEmailService.ts`: Uitgebreide service met admin-functionaliteit

2. **Componenten**:
   - `EmailInbox.tsx`: Hoofdcomponent voor het weergeven van de inbox
   - `EmailItem.tsx`: Component voor het weergeven van een individuele email in de lijst
   - `EmailDetail.tsx`: Component voor het weergeven van de details van een geselecteerde email

3. **Types**:
   - `types.ts`: Bevat de interfaces voor Email en AutoResponse

## API Integratie

De email-service maakt verbinding met een Go backend API om emails op te halen en te beheren. De volgende endpoints worden gebruikt:

- `GET /api/mail`: Alle emails ophalen
- `GET /api/mail/account/:type`: Emails ophalen voor een specifiek account (info of inschrijving)
- `GET /api/mail/:id`: Details van een specifieke email ophalen
- `PUT /api/mail/:id/processed`: Een email markeren als gelezen/ongelezen
- `GET /api/mail/unprocessed`: Ongelezen emails ophalen

## Omgeving Variabelen

Voor het gebruik van deze module zijn de volgende omgevingsvariabelen vereist:

```
VITE_EMAIL_API_URL=https://dkl-email-service.onrender.com
VITE_EMAIL_API_KEY=je_api_sleutel
```

## Gebruik

De `EmailInbox` component kan op verschillende manieren worden gebruikt:

1. Als standalone pagina:
   ```tsx
   <Route path="/emails" element={<EmailInbox />} />
   ```

2. In een tab:
   ```tsx
   export function InboxTab() {
     return <EmailInbox />;
   }
   ```

3. Met een specifiek account:
   ```tsx
   <EmailInbox account="info" />
   ```

## Data Model Mapping

De backend en frontend gebruiken verschillende modellen voor emails. De `mapIncomingEmailToEmail` functie in `emailService.ts` zorgt voor de transformatie tussen deze modellen.

## Autoresponder Functionaliteit

De autoresponder functionaliteit wordt beheerd door de `adminEmailService` en gebruikt Supabase voor de opslag van sjablonen en configuratie. 