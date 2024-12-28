export interface Photo {
  id: string
  url: string
  thumbnail_url?: string
  alt: string
  title?: string
  description?: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
} 