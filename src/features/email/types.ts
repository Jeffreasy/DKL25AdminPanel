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