export interface Photo {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail_url: string | null
  alt: string
  year: number
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

// Voor gebruik in forms
export interface PhotoFormData {
  title: string
  alt: string
  description: string
  year: number
  visible: boolean
}

// Voor API responses
export interface PhotoQueryResult {
  photo: Photo
}

// Voor album relaties
export interface PhotoAlbumRelation {
  photo_id: string
  album_id: string
  order_number: number
} 