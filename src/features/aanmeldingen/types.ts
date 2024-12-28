export interface Aanmelding {
  id: string
  created_at: string
  updated_at: string
  naam: string
  email: string
  telefoon: string | null
  rol: 'Deelnemer' | 'Begeleider' | 'Vrijwilliger'
  afstand: '2.5 KM' | '6 KM' | '10 KM' | '15 KM'
  ondersteuning: 'Ja' | 'Nee' | 'Anders'
  bijzonderheden: string
  terms: boolean
  email_verzonden: boolean
  email_verzonden_op: string | null
} 