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
    }
  }
} 