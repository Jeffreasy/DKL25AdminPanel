export interface Photo {
  id: string
  url: string
  alt?: string
  order_number: number
  visible: boolean
  created_at: string
  updated_at: string
}

export interface Partner {
  id: string
  name: string
  description?: string
  logo?: string
  website?: string
  tier: 'bronze' | 'silver' | 'gold'
  visible: boolean
  order_number: number
  since: string
}

export interface ContactMessage {
  id: string
  naam: string
  email: string
  telefoon: string | null
  bericht: string
  aangemaakt_op: string
  status: 'ongelezen' | 'gelezen'
  gearchiveerd: boolean
}

export interface Inschrijving {
  id: string
  created_at: string
  naam: string
  email: string
  rol: 'Deelnemer' | 'Begeleider' | 'Vrijwilliger'
  telefoon: string | null
  afstand: '2.5 KM' | '6 KM' | '10 KM' | '15 KM'
  ondersteuning: 'Nee' | 'Ja' | 'Anders'
  bijzonderheden: string
  status: 'pending' | 'approved' | 'rejected'
} 