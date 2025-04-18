export interface Photo {
  id: string
  url: string
  thumbnail_url?: string
  title: string
  alt_text?: string
  visible: boolean
  description?: string
  year?: string
  created_at: string
  updated_at: string
  album_photos?: {
    album: {
      id: string
      title: string
    }
  }[]
}

// Voor gebruik in forms
export interface PhotoFormData {
  title: string
  alt_text: string
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

export interface PhotoCount {
  count: number
} 