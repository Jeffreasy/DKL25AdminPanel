export interface AlbumWithDetails {
  id: string
  title: string
  description?: string
  visible: boolean
  cover_photo?: {
    id: string
    url: string
  } | null
  cover_photo_id?: string | null
  photos_count: number
  order_number: number
  created_at: string
  updated_at: string
} 