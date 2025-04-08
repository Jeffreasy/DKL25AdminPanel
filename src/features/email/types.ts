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

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  html: string;
  account: 'info' | 'inschrijving';
  message_id: string;
  created_at: string;
  read: boolean;
  metadata: {
    'return-path': string;
    'delivered-to': string;
    'content-type': string;
    'reply-to': string;
  };
  created_at_system: string;
} 