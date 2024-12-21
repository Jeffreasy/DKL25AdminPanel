import type { Database } from '../../types/supabase'

export type Photo = Database['public']['Tables']['photos']['Row']
export type PhotoInsert = Database['public']['Tables']['photos']['Insert']

export interface PhotoBase {
  id: string
  url: string
  alt: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

export interface PhotoWithDetails extends PhotoBase {
  title: string
  description: string | null
  year: number
}

export interface PhotoSelectorPhoto extends PhotoBase {
  created_at: string
} 