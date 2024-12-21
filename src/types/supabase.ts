import { FileOptions } from '@supabase/storage-js'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      partners: {
        Row: {
          id: string
          name: string
          description: string
          logo: string
          website: string | null
          since: string
          tier: 'bronze' | 'silver' | 'gold'
          visible: boolean
          order_number: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['partners']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['partners']['Insert']>
      }
      photos: {
        Row: {
          id: string
          url: string
          thumbnail_url: string
          alt: string
          order_number: number
          created_at: string
          updated_at: string
          visible: boolean
        }
        Insert: Omit<Database['public']['Tables']['photos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['photos']['Insert']>
      }
      albums: {
        Row: {
          id: string
          title: string
          description: string | null
          cover_photo_id: string | null
          order_number: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['albums']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['albums']['Insert']>
      }
      photos_albums: {
        Row: {
          id: string
          photo_id: string
          album_id: string
          order_number: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['photos_albums']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['photos_albums']['Insert']>
      }
    }
  }
}

export interface CustomFileOptions extends FileOptions {
  onUploadProgress?: (progress: { loaded: number; total: number }) => void
} 