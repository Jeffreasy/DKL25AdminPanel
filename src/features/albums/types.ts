import type { Database } from '../../types/supabase'

export type Album = Database['public']['Tables']['albums']['Row']

export interface AlbumWithDetails extends Album {
  cover_photo: {
    id: string
    url: string
  } | null
  photos_count: number
} 