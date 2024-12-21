export interface Sponsor {
  id: string
  name: string
  logo_url: string
  website_url?: string
  description?: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

export type SponsorInsert = Omit<Sponsor, 'id' | 'created_at' | 'updated_at'> 