export interface Video {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail_url: string | null
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface VideoInsert extends Omit<Video, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {} 