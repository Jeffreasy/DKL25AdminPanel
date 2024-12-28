export type ContactStatus = 'nieuw' | 'in_behandeling' | 'afgehandeld'

export interface ContactMessage {
  // Identificatie
  id: string
  created_at: string
  updated_at: string
  
  // Afzender gegevens
  naam: string
  email: string
  bericht: string
  
  // Status tracking
  status: ContactStatus
  email_verzonden: boolean
  email_verzonden_op: string | null
  privacy_akkoord: boolean
  
  // Admin info
  notities?: string
  behandeld_door?: string
  behandeld_op?: string
}

export interface ContactStats {
  counts: {
    total: number
    new: number
    inProgress: number
    handled: number
  }
  avgResponseTime: number
  messagesByPeriod: {
    daily: number
    weekly: number
    monthly: number
  }
}

export const CONTACT_COLUMNS = [
  {
    title: 'Datum',
    key: 'created_at',
    sortable: true
  },
  {
    title: 'Naam',
    key: 'naam',
    searchable: true
  },
  {
    title: 'Email',
    key: 'email', 
    searchable: true
  },
  {
    title: 'Status',
    key: 'status',
    filterable: true,
    badges: {
      nieuw: 'green',
      in_behandeling: 'orange', 
      afgehandeld: 'blue'
    }
  },
  {
    title: 'Email Verzonden',
    key: 'email_verzonden'
  }
] as const 