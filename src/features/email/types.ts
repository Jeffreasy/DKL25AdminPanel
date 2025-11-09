/**
 * AutoResponse interface voor automatische email templates
 * (Gebruikt voor Supabase auto-response functionaliteit)
 */
export interface AutoResponse {
  id: string
  name: string
  subject: string
  body: string
  template_variables: Record<string, string>
  is_active: boolean
  trigger_event: 'registration' | 'contact' | 'newsletter'
  created_at: string
  updated_at: string
}

/**
 * Email interface - komt overeen met MailResponse uit backend API
 * Zie FRONTEND_BACKEND_API_REFERENCE.md PART 3 voor details
 */
export interface Email {
  id: string
  message_id: string
  sender: string                    // From address
  to: string                        // To address
  subject: string
  html: string                      // Email body (HTML)
  content_type: string
  received_at: string               // ISO timestamp wanneer email ontvangen is
  uid: string                       // Unieke ID van email op mailserver
  account_type: 'info' | 'inschrijving'
  read: boolean                     // Is email verwerkt/gelezen
  processed_at: string | null       // Timestamp wanneer email verwerkt is
  created_at: string                // Timestamp wanneer email in database is opgeslagen
  updated_at: string
}

/**
 * Paginated email response interface
 */
export interface PaginatedEmailResponse {
  emails: Email[]
  totalCount: number
}

/**
 * Email fetch response interface
 */
export interface EmailFetchResponse {
  message: string
  fetchTime: string
}

/**
 * Legacy interface voor backwards compatibility
 * @deprecated Gebruik Email interface zoals gedocumenteerd in PART 3
 */
export interface LegacyEmail {
  id: string
  sender: string
  subject: string
  body: string
  html: string
  account: 'info' | 'inschrijving'
  message_id: string
  created_at: string
  read: boolean
  metadata: {
    'return-path': string
    'delivered-to': string
    'content-type': string
    'reply-to': string
  }
  created_at_system: string
}

/**
 * Participant emails response interface
 * GET /api/participant/emails
 */
export interface ParticipantEmailsResponse {
  participant_emails: string[];
  system_emails: string[];
  all_emails: string[];
  counts: {
    participants: number;
    system: number;
    total: number;
  };
}

/**
 * Helper om LegacyEmail naar nieuwe Email interface te converteren
 */
export function convertLegacyEmail(legacy: LegacyEmail): Email {
  return {
    id: legacy.id,
    message_id: legacy.message_id,
    sender: legacy.sender,
    to: legacy.metadata['delivered-to'],
    subject: legacy.subject,
    html: legacy.html || legacy.body,
    content_type: legacy.metadata['content-type'],
    received_at: legacy.created_at,
    uid: legacy.id, // Fallback als uid niet beschikbaar
    account_type: legacy.account,
    read: legacy.read,
    processed_at: legacy.read ? legacy.created_at : null,
    created_at: legacy.created_at_system || legacy.created_at,
    updated_at: legacy.created_at_system || legacy.created_at
  }
}