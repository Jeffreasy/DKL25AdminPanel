export interface Aanmelding {
  id: string
  naam: string
  email: string
  telefoon: string | null
  status: 'nieuw' | 'in_behandeling' | 'behandeld' | 'geannuleerd'
  created_at: string
  updated_at: string
  rol: 'Deelnemer' | 'Begeleider' | 'Vrijwilliger'
  afstand: '2.5 KM' | '6 KM' | '10 KM' | '15 KM'
  ondersteuning: 'Ja' | 'Nee' | 'Anders'
  bijzonderheden: string
  terms: boolean
  email_verzonden: boolean
  email_verzonden_op: string | null
  behandeld_door: string | null
  behandeld_op: string | null
  notities: string | null
  test_mode: boolean
  antwoorden?: AanmeldingAntwoord[]
}

export interface AanmeldingAntwoord {
  id: string
  aanmelding_id: string
  tekst: string
  verzonden_op: string
  verzond_door: string
  email_verzonden: boolean
}