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

// Main Notulen interface matching API response - flat structure as per document
export interface Notulen {
  id: string
  titel: string
  vergadering_datum: string
  vergaderingDatum?: string // Backward compatibility
  locatie?: string
  voorzitter?: string
  notulist?: string
  aanwezigen?: string[] // Legacy field - combined names
  afwezigen?: string[]  // Legacy field - combined names
  aanwezigen_gebruikers?: string[] // UUIDs of registered users
  afwezigen_gebruikers?: string[]  // UUIDs of registered users
  aanwezigen_gasten?: string[]     // Names of non-registered guests
  afwezigen_gasten?: string[]      // Names of non-registered guests
  agenda_items?: AgendaItem[]
  agendaItems?: AgendaItem[] // Extracted for UI use (backward compatibility)
  besluiten?: Besluit[]
  besluitenList?: Besluit[] // Extracted for UI use (backward compatibility)
  actiepunten?: Actiepunt[]
  actiepuntenList?: Actiepunt[] // Extracted for UI use (backward compatibility)
  notities?: string
  status: 'draft' | 'finalized' | 'archived'
  versie: number
  created_by: string
  created_by_name?: string // Resolved user name: "Joyce Thielen"
  createdAt?: string // Backward compatibility
  created_at: string
  updated_at: string
  updated_by?: string // UUID of last updater
  updated_by_name?: string // Resolved name: "Jeffrey"
  finalized_at?: string
  finalized_by?: string
  finalized_by_name?: string // Resolved name: "SuperAdmin"
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
  aanwezigen?: string[]
  afwezigen?: string[]
  aanwezigen_gebruikers?: string[]
  afwezigen_gebruikers?: string[]
  aanwezigen_gasten?: string[]
  afwezigen_gasten?: string[]
  agenda_items?: AgendaItem[]
  besluiten?: Besluit[]
  actiepunten?: Actiepunt[]
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
  aanwezigen?: string[] // Legacy field
  afwezigen?: string[]  // Legacy field
  aanwezigen_gebruikers?: string[] // UUIDs for registered users
  afwezigen_gebruikers?: string[]  // UUIDs for registered users
  aanwezigen_gasten?: string[]     // Names for guest attendees
  afwezigen_gasten?: string[]      // Names for guest absentees
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
  aanwezigen_gebruikers?: string[] // UUIDs for registered users
  afwezigen_gebruikers?: string[]  // UUIDs for registered users
  aanwezigen_gasten?: string[]     // Names for guest attendees
  afwezigen_gasten?: string[]      // Names for guest absentees
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
