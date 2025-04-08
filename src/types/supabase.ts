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
          tier: 'GOLD' | 'SILVER' | 'BRONZE'
          logo_url: string
          website_url: string | null
          visible: boolean
          order_number: number
          created_at: string
          updated_at: string
        }
      }
      // Voeg andere tabellen toe als nodig
    }
  }
} 