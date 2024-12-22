import type { Database } from './supabase'

// Auth types
export type PasswordStrength = 'weak' | 'medium' | 'strong'

// Partner types
type PartnerRow = Database['public']['Tables']['partners']['Row']
type PartnerTier = PartnerRow['tier']

// Photo types
export interface Photo {
  id: string
  url: string
  alt: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

// Video types
export interface Video {
  id: string
  video_id: string  // YouTube/Vimeo ID
  url: string
  title: string
  description: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

// Shared types
export interface BaseItem {
  id: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

// Re-export everything
export type { PartnerRow, PartnerTier } 