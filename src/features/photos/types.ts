import type { Database } from '../../types/supabase'

// Basis database types
export type PhotoRow = Database['public']['Tables']['photos']['Row']
export type PhotoInsert = Database['public']['Tables']['photos']['Insert']

// Basis interface met verplichte velden
export interface PhotoBase {
  id: string
  url: string
  thumbnail_url: string
  alt: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

// Hoofd Photo type met optionele velden
export interface Photo extends PhotoBase {
  title?: string
  description?: string | null
  year?: number
}

// Voor gebruik in forms en detail views
export interface PhotoWithDetails extends PhotoBase {
  title?: string
  description?: string | null
  year?: number
}

// Voor gebruik in de photo selector
export interface PhotoSelectorPhoto extends PhotoBase {
  created_at: string
} 