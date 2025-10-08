import type { OrderedEntity } from '../../types/base'

export interface Video extends OrderedEntity {
  title: string
  description: string | null
  url: string
  video_id: string
  thumbnail_url: string | null
  deleted_at?: string
}

export interface VideoInsert extends Omit<Video, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'video_id' | 'thumbnail_url'> {
  video_id?: string; 
  thumbnail_url?: string | null;
}

// export interface VideoMetadata {
//   duration?: number
//   resolution?: string
//   format?: string
// } 