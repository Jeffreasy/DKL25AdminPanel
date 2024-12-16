import type { Database } from '../../types/supabase'

export type Photo = Database['public']['Tables']['photos']['Row']
export type PhotoInsert = Database['public']['Tables']['photos']['Insert']

export interface PhotoWithDetails extends Photo {
  title: string
  description: string | null
  year: number
  url: string
  alt: string
  visible: boolean
  order_number: number
} 