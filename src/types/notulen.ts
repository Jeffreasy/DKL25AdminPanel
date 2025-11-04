// API-compliant types matching the backend structure

export interface AgendaItem {
  title: string      // Agenda item title (required)
  details?: string   // Optional details/description
}

export interface Besluit {
  besluit: string           // Decision text (required)
  teams?: {                 // Optional team assignments
    [teamName: string]: string[]
  }
}

export interface Actiepunt {
  actie: string                    // Action description (required)
  verantwoordelijke: string | string[] // Responsible person(s) (required)
  voltooid?: boolean              // Whether action item is completed (default: false)
  voltooid_door?: string          // UUID of person who completed it
  voltooid_op?: string            // ISO timestamp when completed
  voltooid_opmerking?: string     // Optional notes about completion
}

// JSONB wrapper structures as returned by API
export interface AgendaItemsWrapper {
  items: AgendaItem[]
}

export interface BesluitenWrapper {
  besluiten: Besluit[]
}

export interface ActiepuntenWrapper {
  acties: Actiepunt[]
}

// Main Notulen interface matching API response
export interface Notulen {
  id: string
  titel: string
  vergadering_datum: string
  vergaderingDatum?: string // Backward compatibility
  locatie?: string
  voorzitter?: string
  notulist?: string
  aanwezigen: string[]
  afwezigen: string[]
  agenda_items: AgendaItemsWrapper
  agendaItems: AgendaItem[] // Extracted from wrapper for UI use
  besluiten: BesluitenWrapper
  besluitenList: Besluit[] // Extracted from wrapper for UI use
  actiepunten: ActiepuntenWrapper
  actiepuntenList: Actiepunt[] // Extracted from wrapper for UI use
  notities?: string
  status: 'draft' | 'finalized' | 'archived'
  versie: number
  created_by: string
  createdAt?: string // Backward compatibility
  created_at: string
  updated_at: string
  finalized_at?: string
  finalized_by?: string
}

// Version history interface
export interface NotulenVersie {
  id: string
  notulen_id: string
  versie: number
  titel: string
  vergadering_datum: string
  locatie?: string
  voorzitter?: string
  notulist?: string
  aanwezigen: string[]
  afwezigen: string[]
  agenda_items: AgendaItemsWrapper
  besluiten: BesluitenWrapper
  actiepunten: ActiepuntenWrapper
  notities?: string
  status: string
  gewijzigd_door: string
  gewijzigd_op: string
  wijziging_reden?: string
}

// Request interfaces for API calls
export interface NotulenCreateRequest {
  titel: string
  vergadering_datum: string
  locatie?: string
  voorzitter?: string
  notulist?: string
  aanwezigen?: string[]
  afwezigen?: string[]
  agenda_items?: AgendaItem[]
  besluiten?: Besluit[]
  actiepunten?: Actiepunt[]
  notities?: string
}

export interface NotulenUpdateRequest {
  titel?: string
  locatie?: string
  voorzitter?: string
  notulist?: string
  aanwezigen?: string[]
  afwezigen?: string[]
  agenda_items?: AgendaItem[]
  besluiten?: Besluit[]
  actiepunten?: Actiepunt[]
  notities?: string
}

export interface NotulenFinalizeRequest {
  wijziging_reden?: string
}

export interface NotulenFilters {
  status?: 'draft' | 'finalized' | 'archived'
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export interface NotulenSearchParams extends NotulenFilters {
  q: string
}

export interface NotulenListResponse {
  notulen: Notulen[]
  total: number
  limit: number
  offset: number
}
