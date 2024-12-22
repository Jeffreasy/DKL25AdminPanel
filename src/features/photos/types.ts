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

// Voor gebruik in forms en detail views
export interface PhotoWithDetails extends PhotoBase {
  title: string
  description?: string
  year?: number
}

// Voor gebruik in de photo selector
export interface PhotoSelectorPhoto extends PhotoBase {
  inAlbum?: boolean
}

// Voeg Photo type weer toe
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